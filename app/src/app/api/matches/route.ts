import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";
import { getProfile } from "@/lib/chat/conversation";
import { missingProfileFields } from "@/lib/chat/profile";
import { embedQuery } from "@/lib/embeddings";
import { rankListings } from "@/lib/matches/rank";
import { toSqlFilters } from "@/lib/matches/filters";
import type { Candidate, ListingDTO } from "@/lib/matches/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (missingProfileFields(profile).length > 0) {
    return NextResponse.json({ status: "incomplete" });
  }

  try {
    const vec = await embedQuery(profile.soft_prefs || "no specific preferences");
    const vecLiteral = `[${vec.join(",")}]`;
    const filteredProfile = toSqlFilters(profile);

    const candidateRows = await sql<Candidate[]>`
      select
        source || ':' || source_id as id,
        url, title, description,
        price, price_display, bhk, bathrooms, area_sqft, locality,
        furnishing, listing_type, property_type, possession, posted_at
      from match_listings(
        ${vecLiteral}::vector(768),
        20::int,
        ${filteredProfile.listing_type}::text,
        ${filteredProfile.max_price}::bigint,
        ${filteredProfile.min_bhk}::int,
        ${filteredProfile.localities}::text[]
      )
    `;

    const ranked = await rankListings(profile.soft_prefs, candidateRows);
    const byId = new Map(candidateRows.map((c) => [c.id, c]));
    const listings: ListingDTO[] = ranked.flatMap(({ id, reason }) => {
      const c = byId.get(id);
      if (!c) return [];
      return [
        {
          id: c.id,
          url: c.url,
          price: c.price,
          price_display: c.price_display,
          bhk: c.bhk,
          bathrooms: c.bathrooms,
          area_sqft: c.area_sqft,
          locality: c.locality,
          furnishing: c.furnishing,
          listing_type: c.listing_type,
          property_type: c.property_type,
          possession: c.possession,
          posted_at: c.posted_at,
          reason,
        },
      ];
    });

    return NextResponse.json({ status: "ok", listings });
  } catch (err) {
    console.error("GET /api/matches failed:", err);
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "matches_failed", message }, { status: 502 });
  }
}