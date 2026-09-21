import { Badge } from "@/components/ui/badge";
import type { DiscoverListingDTO } from "@/lib/matches/types";

export function ListingCard({
  listing,
}: {
  listing: DiscoverListingDTO & { reason?: string };
}) {
  const {
    url,
    price_display,
    bhk,
    bathrooms,
    area_sqft,
    locality,
    furnishing,
    listing_type,
    property_type,
    possession,
    reason,
  } = listing;

  const facts = [
    bhk ? `${bhk} BHK` : null,
    bathrooms ? `${bathrooms} bath` : null,
    area_sqft ? `${area_sqft} sqft` : null,
    furnishing,
    property_type,
  ].filter(Boolean);

  const card = (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-blue-700">
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg font-semibold text-zinc-100">
          {price_display ?? "Price on request"}
        </span>
        {listing_type && (
          <Badge variant="destructive">{listing_type.toUpperCase()}</Badge>
        )}
      </div>

      {locality && <span className="text-sm text-zinc-300">{locality}</span>}

      {facts.length > 0 && (
        <span className="text-sm text-zinc-500">{facts.join(" · ")}</span>
      )}

      {possession && (
        <span className="text-xs text-zinc-600">Possession: {possession}</span>
      )}

      {reason && (
        <p className="mt-1 border-t border-zinc-800 pt-2 text-sm text-zinc-400">
          {reason}
        </p>
      )}
    </div>
  );

  if (!url) return card;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {card}
    </a>
  );
}
