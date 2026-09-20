import type { Profile } from "@/lib/chat/types";

export interface ProfileSqlFilters {
  listing_type: "sale" | "rent" | null;
  min_bhk: number | null;
  max_price: number | null;
  localities: string[] | null;
}

/**
 * Translates a profile's "no preference" sentinels (0, [], "either") into
 * real SQL null, so match_listings' `x is null or ...` filters correctly
 * treat "no preference" the same as "no filter" instead of matching nothing.
 */
export function toSqlFilters(profile: Profile): ProfileSqlFilters {
  return {
    listing_type: profile.listing_type === "either" ? null : profile.listing_type,
    min_bhk: profile.min_bhk === 0 ? null : profile.min_bhk,
    max_price: profile.max_price === 0 ? null : profile.max_price,
    localities: profile.localities?.length === 0 ? null : profile.localities,
  };
}
