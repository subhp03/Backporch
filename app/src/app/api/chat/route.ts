import { NextResponse, type NextRequest } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";
import { updateProfile } from "@/lib/chat/profile";
import { getConversation, getProfile } from "@/lib/chat/conversation";
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
    const profile = await updateProfile(current, message);

    await sql`
      insert into profiles (user_id, listing_type, min_bhk, max_price, localities, soft_prefs, raw, updated_at)
      values (${user.id}, ${profile.listing_type}, ${profile.min_bhk}, ${profile.max_price},
              ${profile.localities}, ${profile.soft_prefs}, ${sql.json(profile)}, now())
      on conflict (user_id) do update set
        listing_type = excluded.listing_type,
        min_bhk = excluded.min_bhk,
        max_price = excluded.max_price,
        localities = excluded.localities,
        soft_prefs = excluded.soft_prefs,
        raw = excluded.raw,
        updated_at = now()
    `;

    const { text: reply } = await generateText({
      model: google("gemini-flash-lite-latest"),
      system:
        "You are a concise Kolkata property search assistant. In one or two " +
        "sentences, tell the user what you understood about their preferences.",
      prompt: `Profile: ${JSON.stringify(profile)}`,
    });

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

  const [conversation] = await sql<{ id: string }[]>`
    select id from conversations where user_id = ${user.id}
    order by updated_at desc limit 1
  `;

  const profile = await getProfile(user.id);

  const messages = conversation
    ? await sql<
        { role: "user" | "assistant"; content: string; listing_ids: string[] | null }[]
      >`
        select role, content, listing_ids from messages
        where conversation_id = ${conversation.id}
        order by created_at asc
      `
    : [];

  const payload: ChatHistoryResponse = {
    conversationId: conversation?.id ?? null,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      listingIds: m.listing_ids,
    })),
    profile,
  };
  return NextResponse.json(payload);
}
