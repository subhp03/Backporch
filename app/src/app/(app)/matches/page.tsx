import { headers } from "next/headers";
import { ListingCard } from "@/components/ListingCard";
import { requireCompleteProfile } from "@/lib/chat/gate";
import type { ListingDTO } from "@/lib/matches/types";

type MatchesResponse =
  | { status: "incomplete" }
  | { status: "ok"; listings: ListingDTO[] }
  | { error: string; message: string };

export default async function MatchesPage() {
  await requireCompleteProfile();

  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/matches`, {
    headers: { cookie: incomingHeaders.get("cookie") ?? "" },
    cache: "no-store",
  });
  const response: MatchesResponse = await res.json();

  if ("error" in response) {
    return <p className="p-6 text-red-400">Something went wrong: {response.message}</p>;
  }

  if (response.status !== "ok" || response.listings.length === 0) {
    return <p className="p-6 text-zinc-400">No matches found yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {response.listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
