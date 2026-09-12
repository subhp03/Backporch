"""
Map a raw MagicBricks `resultList` item onto `Listing`.

MagicBricks items are already structured (~180 fields). We pick the factual
ones plus the source title and description (kept for embedding and ranking,
not for verbatim display). Photos and advertiser personal data are not read.
"""

from typing import Optional

from .schema import Listing


def _int(v) -> Optional[int]:
    try:
        return int(float(str(v).replace(",", "").strip()))
    except (TypeError, ValueError):
        return None


def _float(v) -> Optional[float]:
    try:
        return float(str(v).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def _coords(raw: dict) -> tuple[Optional[float], Optional[float]]:
    geo = raw.get("ltcoordGeo")
    if isinstance(geo, str) and "," in geo:
        lat, _, lng = geo.partition(",")
        lat, lng = _float(lat), _float(lng)
        if lat and lng:
            return lat, lng
    return _float(raw.get("pmtLat")), _float(raw.get("pmtLong"))


def _rera(raw: dict) -> Optional[str]:
    """`reraValidity` looks like 'NA|null,WBRERA/P/NOR/2026/004195|-1'."""
    val = raw.get("reraValidity") or ""
    for token in val.split(","):
        rid = token.split("|")[0].strip()
        if rid and rid.upper() != "NA":
            return rid
    return None


def _detail_url(raw: dict) -> Optional[str]:
    # MagicBricks builds detail links as `propertyDetails/<url>`, where `url`
    # already carries its own `&id=<hex>` suffix (their convention, not a
    # query string). `seoURL` is a differently-encoded variant that 404s
    # without a second `propertyDetails/` segment, so prefer `url`.
    url = raw.get("url")
    if url:
        return f"https://www.magicbricks.com/propertyDetails/{url}"
    seo = raw.get("seoURL")
    if seo:
        return f"https://www.magicbricks.com/propertyDetails/{seo}"
    return None


def to_listing(raw: dict, category: str) -> Listing:
    lat, lng = _coords(raw)
    return Listing(
        source="magicbricks",
        source_id=str(raw.get("id")) if raw.get("id") is not None else None,
        url=_detail_url(raw),

        title=raw.get("propertyTitle") or raw.get("auto_desc"),
        description=raw.get("seoDesc") or raw.get("dtldesc"),

        price=_int(raw.get("price")),
        price_display=raw.get("priceD"),
        price_per_sqft=_float(raw.get("sqFtPrice")),

        bhk=_int(raw.get("bedroomD")),
        bathrooms=_int(raw.get("bathD")),
        balconies=_int(raw.get("balconiesD")),
        area_sqft=_float(raw.get("caSqFt")),
        carpet_area_sqft=_float(raw.get("carpetArea")),
        area_unit=raw.get("coverAreaUnitD"),

        locality=raw.get("lmtDName") or raw.get("locSeoName"),
        city=raw.get("ctName") or "Kolkata",
        lat=lat,
        lng=lng,

        furnishing=raw.get("furnishedD"),
        listing_type=category,
        transaction_type=raw.get("transactionTypeD"),
        property_type=raw.get("propTypeD"),
        possession=raw.get("possStatusD"),
        project_name=raw.get("prjname"),
        tenant_preference=raw.get("tenantsPreference"),
        rera=_rera(raw),

        posted_at=raw.get("postDateT"),
    )
