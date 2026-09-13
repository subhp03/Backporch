import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { Candidate } from "@/lib/matches/types";

const MODEL = "gemini-flash-lite-latest";
const TOP_N = 8;

const RankSchema = z.object({
  ranked: z.array(
    z.object({
      id: z.string(),
      reason: z.string(), // one short sentence: why this listing fits
    }),
  ),
});

/**
 * Re-rank the SQL/vector candidates against the user's qualitative wants and
 * attach a one-line reason to each. The candidates' description is used for
 * reasoning here but is never returned to the client.
 */
export async function rankListings(
  softPrefs: string | null,
  candidates: Candidate[],
): Promise<{ id: string; reason: string }[]> {
  if (candidates.length === 0) return [];

  const brief = candidates.map((c) => ({
    id: c.id,
    bhk: c.bhk,
    locality: c.locality,
    price: c.price_display,
    area_sqft: c.area_sqft,
    furnishing: c.furnishing,
    listing_type: c.listing_type,
    property_type: c.property_type,
    possession: c.possession,
    text: [c.title, c.description].filter(Boolean).join(". ").slice(0, 800),
  }));

  const { output } = await generateText({
    model: google(MODEL),
    output: Output.object({ schema: RankSchema }),
    system: `You rank Kolkata flat listings for a user. Order the candidates
best-first for how well they match the user's stated preferences. Return at
most ${TOP_N}. Drop clearly poor matches rather than padding the list. For each,
give one short sentence on why it fits (or its main caveat). Use only the
provided ids.`,
    prompt: `User's qualitative preferences: ${softPrefs || "(none stated)"}

Candidates:
${JSON.stringify(brief, null, 2)}`,
  });

  const valid = new Set(candidates.map((c) => c.id));
  return output.ranked.filter((r) => valid.has(r.id)).slice(0, TOP_N);
}
