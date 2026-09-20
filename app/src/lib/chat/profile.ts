import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { ProfileSchema, type Profile } from "./types";

const MODEL = "gemini-flash-lite-latest";

const SYSTEM = `You maintain a structured property-search profile for a user
looking for a living spce in Kolkata.

Given the current profile and the user's new message, return the updated profile.
Rules:
- Keep every existing value unless the user's message changes or removes it.
- listing_type: "rent", "sale", or "either" if the user has no preference.
  Infer from wording ("rent", "PG", "lease" -> rent).
- min_bhk: the minimum bedroom count the user will accept, or 0 if the user
  has no minimum.
- max_price: a number in rupees, or 0 if the user has no maximum.
  "40k" -> 40000, "1.2 cr" -> 12000000, "80 lakh" -> 8000000.
- localities: Kolkata neighbourhood names only (e.g. "Salt Lake", "New Town",
  "Ballygunge", "Behala"). Normalise casing. Drop non-Kolkata places. Use []
  (empty array) if the user has no locality preference.
- soft_prefs: a short free-text summary of qualitative wants that are not
  captured by the fields above (light, noise, proximity to transit/parks,
  floor, view, pet-friendly, etc.). Merge new wants into the existing string.
  Use "" (empty string) if the user has nothing further to add.
- Use null for any field the user has not yet been asked about, including
  soft_prefs. Only replace a field's null with a real value (or a
  no-preference sentinel: 0, [], "", or "either") when the user's message is
  actually answering a question about THAT field. Never guess or fill in a
  no-preference sentinel for a field the conversation hasn't reached yet,
  even if the user's message sounds broadly done or enthusiastic.
- Once a field has been asked about and answered, even with "no" or "none",
  it must never go back to null: use the matching no-preference sentinel.
If all fields are non-null, end the conversation and direct the user to /matches.
`;

export async function updateProfile(
  current: Profile,
  message: string,
): Promise<Profile> {
  const { output } = await generateText({
    model: google(MODEL),
    output: Output.object({ schema: ProfileSchema }),
    system: SYSTEM,
    prompt: `Current profile:\n${JSON.stringify(current, null, 2)}\n\nUser message:\n${message}`,
  });
  return output;
}

const PROFILE_FIELDS = [
  "listing_type",
  "min_bhk",
  "max_price",
  "localities",
  "soft_prefs",
] as const satisfies readonly (keyof Profile)[];

export function missingProfileFields(profile: Profile): (keyof Profile)[] {
  return PROFILE_FIELDS.filter((field) => profile[field] === null);
}

/**
 * The chat's reply after a profile update, or the opening message for a
 * brand-new conversation (profile has no prior messages yet). Both cases ask
 * about one missing field at a time until the profile is complete.
 */
export async function generateAssistantReply(
  profile: Profile,
  { isOpening = false }: { isOpening?: boolean } = {},
): Promise<string> {
  const missingFields = missingProfileFields(profile);

  if (missingFields.length === 0) {
    const { text } = await generateText({
      model: google(MODEL),
      system:
        "You are a concise Kolkata property search assistant. In one " +
        "sentence, acknowledge that their preferences are complete.",
      prompt: `Profile: ${JSON.stringify(profile)}`,
    });
    return text;
  }

  const { text } = await generateText({
    model: google(MODEL),
    system: isOpening
      ? "You are greeting a new user for a Kolkata property search assistant. " +
        "In one short, friendly message, introduce yourself and ask about ONE " +
        "of the missing fields below to start building their profile."
      : "You are onboarding a user for a Kolkata property search. Ask a " +
        "short, natural question about ONE of the missing fields below. " +
        "Do not ask about fields that are already filled in.",
    prompt:
      `Profile: ${JSON.stringify(profile)}\n` +
      `Missing fields: ${missingFields.join(", ")}`,
  });
  return text;
}
