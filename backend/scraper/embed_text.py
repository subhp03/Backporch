"""
Build the text that represents a listing for embedding.

Facts first (so structured queries match even when the description is thin),
then the source description. Reused on ingest and, later, on the query side.
"""


def listing_embed_text(row: dict) -> str:
    facts: list[str] = []
    if row.get("bhk"):
        facts.append(f"{row['bhk']} BHK")
    if row.get("property_type"):
        facts.append(str(row["property_type"]))
    facts.append(f"for {row.get('listing_type') or 'sale'}")
    if row.get("locality"):
        facts.append(f"in {row['locality']}, {row.get('city') or 'Kolkata'}")
    if row.get("area_sqft"):
        facts.append(f"{int(row['area_sqft'])} sqft")
    if row.get("furnishing"):
        facts.append(str(row["furnishing"]))
    if row.get("price_display"):
        facts.append(f"priced {row['price_display']}")
    if row.get("possession"):
        facts.append(f"possession {row['possession']}")

    head = ", ".join(facts) + "."
    desc = (row.get("description") or "").strip()
    return f"{head}\n{desc}".strip()
