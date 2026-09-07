"""
Run a full scrape from a config dict and return normalized `Listing` objects.

Shared by `scrape.py` (writes files) and `ingest.py` (writes the DB).
"""

from .client import make_session
from .magicbricks import iter_listings
from .normalize import to_listing
from .schema import Listing


def collect_listings(cfg: dict) -> list[Listing]:
    city = cfg.get("city", "kolkata")
    categories = cfg.get("categories", ["sale"])
    max_pages = cfg.get("max_pages", 20)
    property_types = cfg.get("property_types")  # None -> scraper default
    between = cfg.get("rate_limit", {}).get("between_pages", 1.0)

    session = make_session()
    listings: list[Listing] = []
    for category in categories:
        for raw in iter_listings(
            session, city, category, max_pages, between, property_types
        ):
            listings.append(to_listing(raw, category))
    return listings
