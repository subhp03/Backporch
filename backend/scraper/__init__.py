"""Residential listings scraper"""

from .client import make_session
from .collect import collect_listings
from .embed_text import listing_embed_text
from .magicbricks import iter_listings
from .normalize import to_listing
from .schema import Listing, FIELDS

__all__ = [
    "make_session",
    "collect_listings",
    "listing_embed_text",
    "iter_listings",
    "to_listing",
    "Listing",
    "FIELDS",
]
