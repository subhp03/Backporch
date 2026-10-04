import { ListingCard } from "@/components/ListingCard";
import { sampleListings } from "./sample-listings";

export function MatchesPreview() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl shadow-black/50">
      <div className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 rounded-full bg-zinc-800 px-4 py-1 text-sm text-zinc-400">
          backporch/matches
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 [zoom:0.7] sm:grid-cols-3">
        {sampleListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
