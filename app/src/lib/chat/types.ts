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
