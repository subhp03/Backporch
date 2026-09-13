import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";

export default function MatchesLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
