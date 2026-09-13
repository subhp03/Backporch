import { z } from "zod";

export const ProfileSchema = z.object({
  listing_type: z.enum(["sale", "rent"]).nullable(),
  min_bhk: z.number().int().nullable(),
  max_price: z.number().int().nullable(), // rupees
  localities: z.array(z.string()).nullable(),
  soft_prefs: z.string().nullable(), // qualitative wants: "quiet, good light, near a metro"
});

export type Profile = z.infer<typeof ProfileSchema>;

export const EMPTY_PROFILE: Profile = {
  listing_type: null,
  min_bhk: null,
  max_price: null,
  localities: null,
  soft_prefs: null,
};

/** A candidate row as selected from match_listings (internal, includes source text). */
export interface Candidate {
  id: string; // "source:source_id"
  url: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  price_display: string | null;
  bhk: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  locality: string | null;
  furnishing: string | null;
  listing_type: string | null;
  property_type: string | null;
  possession: string | null;
  posted_at: string | null;
}

/** What the API returns per listing: facts + a reason, never the raw description. */
export type ListingDTO = Omit<Candidate, "title" | "description"> & {
  reason: string;
};

export interface ChatResponse {
  conversationId: string;
  reply: string;
  profile: Profile;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  listingIds: string[] | null;
}

export interface ChatHistoryResponse {
  conversationId: string | null;
  messages: ChatHistoryMessage[];
  profile: Profile;
}
