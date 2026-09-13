/** A candidate row as selected from match_listings (internal, includes source text). */
export interface Candidate {
  id: string; // "source:source_id"
  url: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  price_display: string | null;
  bhk: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  locality: string | null;
  furnishing: string | null;
  listing_type: string | null;
  property_type: string | null;
  possession: string | null;
  posted_at: string | null;
}

/** What the API returns per listing: facts + a reason, never the raw description. */
export type ListingDTO = Omit<Candidate, "title" | "description"> & {
  reason: string;
};
