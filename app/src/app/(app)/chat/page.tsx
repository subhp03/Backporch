import { headers } from "next/headers";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatHistoryResponse } from "@/lib/chat/types";

export default async function ChatPage() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/chat`, {
    headers: { cookie: incomingHeaders.get("cookie") ?? "" },
    cache: "no-store",
  });
  const history: ChatHistoryResponse = await res.json();

  return <ChatPanel initialHistory={history} />;
}
