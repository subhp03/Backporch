"""Residential listings scraper"""

from .client import make_session
from .magicbricks import iter_listings
from .normalize import to_listing
from .schema import Listing, FIELDS

__all__ = [
    "make_session",
    "iter_listings",
    "to_listing",
    "Listing",
    "FIELDS",
]
