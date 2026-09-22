import { BedDouble, Bath, Maximize, MapPin, CalendarDays } from "lucide-react";
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
    bhk ? { icon: BedDouble, label: `${bhk} BHK` } : null,
    bathrooms ? { icon: Bath, label: `${bathrooms} bath` } : null,
    area_sqft ? { icon: Maximize, label: `${area_sqft} sqft` } : null,
  ].filter((f) => f !== null);

  const otherDetails = [furnishing, property_type].filter(Boolean);

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
        {locality && (
          <span className="mb-2 flex items-center gap-1.5 text-md text-zinc-300">
            <MapPin className="h-4 w-4 text-zinc-400" />
            {locality}
          </span>
        )}

        {facts.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {facts.map(({ icon: Icon, label }, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-base text-zinc-200"
              >
                <Icon className="h-4 w-4 text-zinc-400" />
                {label}
              </span>
            ))}
          </div>
        )}

        {otherDetails.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {otherDetails.map((detail, i) => (
              <Badge key={i} variant="secondary">
                {detail}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {(reason || possession) && (
        <CardFooter className="flex flex-col items-start gap-1 border-zinc-800 bg-transparent text-sm text-zinc-400">
          {reason && <span>{reason}</span>}
          {possession && (
            <span className="flex items-center gap-1.5 text-sm text-zinc-300">
              <CalendarDays className="h-4 w-4 text-zinc-400" />
              Possession: {possession}
            </span>
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
