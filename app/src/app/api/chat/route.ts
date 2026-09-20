import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";
import { updateProfile, generateAssistantReply } from "@/lib/chat/profile";
import { getConversation, getOrCreateConversation, getProfile } from "@/lib/chat/conversation";
import type { ChatResponse, ChatHistoryResponse } from "@/lib/chat/types";

export const runtime = "nodejs";

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsedRequest = ChatRequestSchema.safeParse(requestBody);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const { message, conversationId: requestedConversationId } = parsedRequest.data;
  const conversationId = await getConversation(user.id, requestedConversationId);
  if (!conversationId) {
    return NextResponse.json({ error: "conversation not found" }, { status: 404 });
  }

  await sql`
    insert into messages (conversation_id, role, content)
    values (${conversationId}, 'user', ${message})
  `;

  try {
    const current = await getProfile(user.id);
    const extractedProfile = await updateProfile(current, message);

    await sql`
      insert into profiles (user_id, listing_type, min_bhk, max_price, localities, soft_prefs, raw, updated_at)
      values (${user.id}, ${extractedProfile.listing_type}, ${extractedProfile.min_bhk}, ${extractedProfile.max_price},
              ${extractedProfile.localities}, ${extractedProfile.soft_prefs}, ${sql.json(extractedProfile)}, now())
      on conflict (user_id) do update set
        listing_type = excluded.listing_type,
        min_bhk = excluded.min_bhk,
        max_price = excluded.max_price,
        localities = excluded.localities,
        soft_prefs = excluded.soft_prefs,
        raw = excluded.raw,
        updated_at = now()
    `;

    // Re-read what was actually persisted rather than trusting the LLM's
    // in-memory output, so the next question reflects the real DB state.
    const profile = await getProfile(user.id);
    const reply = await generateAssistantReply(profile);

    await sql`
      insert into messages (conversation_id, role, content)
      values (${conversationId}, 'assistant', ${reply})
    `;
    await sql`update conversations set updated_at = now() where id = ${conversationId}`;

    const payload: ChatResponse = { conversationId, reply, profile };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("POST /api/chat failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: "chat_failed", message, conversationId },
      { status: 502 },
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  const conversationId = await getOrCreateConversation(user.id);

  const existingMessages = await sql<
    { role: "user" | "assistant"; content: string; listing_ids: string[] | null }[]
  >`
    select role, content, listing_ids from messages
    where conversation_id = ${conversationId}
    order by created_at asc
  `;

  // Brand-new conversation: seed the AI's opening message so the user
  // isn't the one who has to speak first.
  const messages: { role: "user" | "assistant"; content: string; listing_ids: string[] | null }[] =
    existingMessages.length > 0 ? existingMessages : [];

  if (messages.length === 0) {
    const opening = await generateAssistantReply(profile, { isOpening: true });
    await sql`
      insert into messages (conversation_id, role, content)
      values (${conversationId}, 'assistant', ${opening})
    `;
    messages.push({ role: "assistant", content: opening, listing_ids: null });
  }

  const payload: ChatHistoryResponse = {
    conversationId,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      listingIds: m.listing_ids,
    })),
    profile,
  };
  return NextResponse.json(payload);
}
