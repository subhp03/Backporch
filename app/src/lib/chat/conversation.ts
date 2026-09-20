import { sql } from "@/lib/db";
import { EMPTY_PROFILE, type Profile } from "@/lib/chat/types";

interface ProfileRow {
  listing_type: Profile["listing_type"];
  min_bhk: number | null;
  max_price: number | null;
  localities: string[] | null;
  soft_prefs: string | null;
}

// row is undefined for a first-time user: no `profiles` row exists yet.
export function profileFromRow(row: ProfileRow | undefined): Profile {
  if (!row) return EMPTY_PROFILE;
  return {
    listing_type: row.listing_type ?? null,
    min_bhk: row.min_bhk ?? null,
    max_price: row.max_price ?? null,
    localities: row.localities ?? null,
    soft_prefs: row.soft_prefs ?? null,
  };
}

export async function getProfile(userId: string): Promise<Profile> {
  const [row] = await sql<ProfileRow[]>`
    select listing_type, min_bhk, max_price, localities, soft_prefs
    from profiles where user_id = ${userId}
  `;
  return profileFromRow(row);
}

// Finds or creates the user's most recent conversation. Always resolves.
export async function getOrCreateConversation(userId: string): Promise<string> {
  const [existing] = await sql<{ id: string }[]>`
    select id from conversations where user_id = ${userId}
    order by updated_at desc limit 1
  `;
  if (existing) return existing.id;
  const [created] = await sql<{ id: string }[]>`
    insert into conversations (user_id) values (${userId}) returning id
  `;
  return created.id;
}

// Resolves a specific conversation the caller claims to own, falling back to
// getOrCreateConversation when no id was given. Returns null only when the
// given id doesn't belong to this user.
export async function getConversation(
  userId: string,
  conversationId?: string,
): Promise<string | null> {
  if (!conversationId) return getOrCreateConversation(userId);

  const [row] = await sql<{ id: string }[]>`
    select id from conversations
    where id = ${conversationId} and user_id = ${userId}
  `;
  return row ? row.id : null;
}
