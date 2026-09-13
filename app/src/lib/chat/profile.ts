import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { ProfileSchema, type Profile } from "./types";

const MODEL = "gemini-flash-lite-latest";

const SYSTEM = `You maintain a structured property-search profile for a user
looking for a living spce in Kolkata.

Given the current profile and the user's new message, return the updated profile.
Rules:
- Keep every existing value unless the user's message changes or removes it.
- listing_type: "rent" or "sale". Infer from wording ("rent", "PG", "lease" -> rent).
- min_bhk: the minimum bedroom count the user will accept.
- max_price: a number in rupees. "40k" -> 40000, "1.2 cr" -> 12000000, "80 lakh" -> 8000000.
- localities: Kolkata neighbourhood names only (e.g. "Salt Lake", "New Town",
  "Ballygunge", "Behala"). Normalise casing. Drop non-Kolkata places.
- soft_prefs: a short free-text summary of qualitative wants that are not
  captured by the fields above (light, noise, proximity to transit/parks,
  floor, view, pet-friendly, etc.). Merge new wants into the existing string.
- Use null for anything the user has not expressed.`;

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
