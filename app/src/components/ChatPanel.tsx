"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { missingProfileFields } from "@/lib/chat/profile";
import { TypingIndicator } from "@/components/TypingIndicator";
import type {
  ChatHistoryMessage,
  ChatHistoryResponse,
  ChatResponse,
  Profile,
} from "@/lib/chat/types";

export function ChatPanel({
  initialHistory,
}: {
  initialHistory: ChatHistoryResponse;
}) {
  const [conversationId, setConversationId] = useState(
    initialHistory.conversationId,
  );
  const [messages, setMessages] = useState<ChatHistoryMessage[]>(
    initialHistory.messages,
  );
  const [profile, setProfile] = useState<Profile>(initialHistory.profile);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const isOnboarding = missingProfileFields(profile).length > 0;

  async function sendMessage() {
    const message = draft.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: message, listingIds: null }]);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });
      const data: ChatResponse = await res.json();
      setConversationId(data.conversationId);
      setProfile(data.profile);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, listingIds: null },
      ]);
    } finally {
      setSending(false);
    }
  }

  const panel = (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-4">
      <div className="flex-1 space-y-3 overflow-auto scrollbar-none py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              "w-fit min-w-70 max-w-[80%] rounded-lg px-4 py-2 text-sm " +
              (m.role === "user"
                ? "ml-auto bg-zinc-800 text-zinc-100"
                : "bg-zinc-900 text-zinc-300")
            }
          >
            {m.content}
          </div>
        ))}
        {sending && <TypingIndicator />}
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800 py-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-zinc-100 p-2 text-black disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (isOnboarding) {
    return <div className="fixed inset-0 z-50 bg-black">{panel}</div>;
  }

  return <div className="h-[calc(100dvh-4rem)]">{panel}</div>;
}
