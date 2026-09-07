"""
The canonical listing record.

`Listing` is the contract every downstream part of Backporch (pipeline,
matching agent, API) builds on. It holds only facts: numbers, categories,
coordinates, timestamps. The source portal's copyrighted text (titles,
descriptions, photos) and personal data (advertiser names, contact) are
never stored.
"""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class Listing(BaseModel):
    source: str = "magicbricks"
    source_id: Optional[str] = None
    url: Optional[str] = None

    price: Optional[int] = None            # rupees, absolute
    price_display: Optional[str] = None    # "1.17 Cr", "22,000"
    price_per_sqft: Optional[float] = None

    bhk: Optional[int] = None
    bathrooms: Optional[int] = None
    balconies: Optional[int] = None
    area_sqft: Optional[float] = None      # covered area
    carpet_area_sqft: Optional[float] = None
    area_unit: Optional[str] = None

    locality: Optional[str] = None
    city: str = "Kolkata"
    lat: Optional[float] = None
    lng: Optional[float] = None

    furnishing: Optional[str] = None
    listing_type: Optional[str] = None       # "sale" | "rent"
    transaction_type: Optional[str] = None   # "New Property" | "Resale"
    property_type: Optional[str] = None      # "Apartment", ...
    possession: Optional[str] = None
    project_name: Optional[str] = None
    tenant_preference: Optional[str] = None   # rent only
    rera: Optional[str] = None

    posted_at: Optional[str] = None          # ISO timestamp, from the source
    scraped_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# Column order for CSV output.
FIELDS = list(Listing.model_fields)
