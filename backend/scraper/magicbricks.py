"""
MagicBricks search client, paginates the internal JSON API for a city.

Endpoint (verified 2026-09-03):
    GET https://www.magicbricks.com/mbsrp/propertySearch.html
Each response carries `resultList`: ~30 fully structured listing objects.
No HTML parsing needed.
"""

import re
import time

from .client import get_json

SEARCH_PAGE = (
    "https://www.magicbricks.com/property-for-{deal}/residential-real-estate"
    "?cityName={city_name}"
)
API_URL = "https://www.magicbricks.com/mbsrp/propertySearch.html"

PAGE_SIZE = 30

# MagicBricks numeric city codes. To be extended in future
CITY_CODES = {
    "kolkata": "6903",
}

# MagicBricks residential property-type codes (verified 2026-09-07).
PROPERTY_TYPE_CODES = {
    "apartment": "10002",
    "builder_floor": "10003",
    "penthouse": "10021",
    "studio": "10022",
    "independent_house": "10001",
    "villa": "10017",
    "plot": "10000",
}

# Places to live: everything except bare plots.
DEFAULT_PROPERTY_TYPES = [
    "apartment", "builder_floor", "penthouse", "studio",
    "independent_house", "villa",
]

# category -> (API code, URL slug for the search page)
CATEGORIES = {
    "sale": ("S", "sale"),
    "rent": ("R", "rent"),
}


def _search_page_url(city: str, category: str) -> str:
    _, deal = CATEGORIES[category]
    return SEARCH_PAGE.format(deal=deal, city_name=city.title())


def _city_code(session, city: str, category: str) -> str:
    """Return MagicBricks' numeric code for `city`, scraping the search page
    as a fallback for cities not in CITY_CODES."""
    key = city.lower().strip()
    if key in CITY_CODES:
        return CITY_CODES[key]
    html = session.get(_search_page_url(city, category), timeout=25).text
    m = re.search(r'"ct"\s*:\s*"?(\d{3,6})"?', html)
    if not m:
        raise RuntimeError(f"Could not determine MagicBricks city code for {city!r}")
    return m.group(1)


def warm_up(session, city: str, category: str) -> str:
    """Hit the search page so the session picks up cookies; return city code."""
    url = _search_page_url(city, category)
    session.headers["Referer"] = url
    resp = session.get(url, timeout=25)
    print(f"Warm-up {url} -> {resp.status_code}")
    return _city_code(session, city, category)


def _property_type_param(property_types: list[str] | None) -> str:
    names = property_types or DEFAULT_PROPERTY_TYPES
    try:
        return ",".join(PROPERTY_TYPE_CODES[n] for n in names)
    except KeyError as e:
        raise RuntimeError(
            f"Unknown property type {e.args[0]!r}. "
            f"Valid: {sorted(PROPERTY_TYPE_CODES)}"
        ) from None


def iter_listings(session, city: str, category: str, max_pages: int,
                  between_pages: float = 1.0,
                  property_types: list[str] | None = None):
    """Yield raw listing dicts for `city` / `category` ('sale' | 'rent')."""
    city_code = warm_up(session, city, category)
    cat_code = CATEGORIES[category][0]
    ptype_param = _property_type_param(property_types)
    print(f"\n=== MagicBricks: {city} / {category}  (city={city_code}) ===")

    seen: set[str] = set()
    for page in range(1, max_pages + 1):
        params = {
            "editSearch": "Y",
            "category": cat_code,
            "propertyType": ptype_param,
            "pType": ptype_param,
            "city": city_code,
            "page": page,
            "groupstart": (page - 1) * PAGE_SIZE,
            "offset": 0,
            "maxOffset": 664,
            "sortBy": "premiumRecent",
            "postedSince": -1,
            "isNRI": "N",
            "multiLang": "en",
        }
        data = get_json(session, API_URL, params)
        if data is None:
            print(f"  Page {page}: request failed, stopping")
            break

        result_list = data.get("resultList") or []
        new = [it for it in result_list if str(it.get("id")) not in seen]
        if not new:
            print(f"  Page {page}: no new listings, stopping")
            break

        for it in new:
            seen.add(str(it.get("id")))
        print(f"  Page {page}: +{len(new)} new (total {len(seen)})")
        yield from new

        if page < max_pages:
            time.sleep(between_pages)
