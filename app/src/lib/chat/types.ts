import { z } from "zod";

// null means the user hasn't answered yet, so the chat keeps asking.
// A non-null sentinel ("either", 0, [], "") means the user answered with
// "no preference": the field is treated as filled and never asked again.
export const ProfileSchema = z.object({
  listing_type: z.enum(["sale", "rent", "either"]).nullable(),
  min_bhk: z.number().int().nullable(), // 0 = no minimum
  max_price: z.number().int().nullable(), // rupees; 0 = no maximum
  localities: z.array(z.string()).nullable(), // [] = no locality preference
  soft_prefs: z.string().nullable(), // "" = nothing further to add
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
  conversationId: string;
  messages: ChatHistoryMessage[];
  profile: Profile;
}
