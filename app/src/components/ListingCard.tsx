import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
    <Card className="h-full gap-2 border border-zinc-800 bg-zinc-950 transition-colors hover:border-blue-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-zinc-100">
          {price_display ?? "Price on request"}
        </CardTitle>
        {listing_type && (
          <CardAction>
            <Badge variant="destructive">{listing_type.toUpperCase()}</Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2">
        {locality && <span className="text-sm text-zinc-300">{locality}</span>}

        {facts.length > 0 && (
          <span className="text-sm text-zinc-500">{facts.join(" · ")}</span>
        )}
      </CardContent>

      {(reason || possession) && (
        <CardFooter className="flex flex-col items-start gap-1 border-zinc-800 bg-transparent text-sm text-zinc-400">
          {reason && <span>{reason}</span>}
          {possession && (
            <span className="text-xs text-zinc-600">Possession: {possession}</span>
          )}
        </CardFooter>
      )}
    </Card>
  );

  if (!url) return card;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
      {card}
    </a>
  );
}
