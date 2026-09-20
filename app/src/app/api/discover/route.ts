import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";
import { getProfile } from "@/lib/chat/conversation";
import { missingProfileFields } from "@/lib/chat/profile";
import { toSqlFilters } from "@/lib/matches/filters";
import type { DiscoverListingDTO } from "@/lib/matches/types";

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

  const filteredProfile = toSqlFilters(profile);

  const listings = await sql<DiscoverListingDTO[]>`
    select
      source || ':' || source_id as id,
      url, price, price_display, bhk, bathrooms, area_sqft, locality,
      furnishing, listing_type, property_type, possession, posted_at
    from listings
    where is_active
      and (${filteredProfile.localities}::text[] is null or locality = any(${filteredProfile.localities}::text[]))
    order by random()
    limit 20
  `;

  return NextResponse.json({ status: "ok", listings });
}
