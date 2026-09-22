import { headers } from "next/headers";
import { ListingCard } from "@/components/ListingCard";
import { requireCompleteProfile } from "@/lib/chat/gate";
import type { DiscoverListingDTO } from "@/lib/matches/types";

type DiscoverResponse =
  | { status: "incomplete" }
  | { status: "ok"; listings: DiscoverListingDTO[] };

export default async function DiscoverPage() {
  await requireCompleteProfile();

  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/discover`, {
    headers: { cookie: incomingHeaders.get("cookie") ?? "" },
    cache: "no-store",
  });
  const response: DiscoverResponse = await res.json();

  if (response.status !== "ok" || response.listings.length === 0) {
    return <p className="p-6 text-zinc-400">No listings found right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {response.listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
