"""
Backporch MagicBricks Kolkata listing scraper.

Usage:
    python scrape.py [--config config.yml]

Paginates MagicBricks' internal JSON search API for the configured city and
categories, normalizes each listing to `Listing`, and writes
`output/results.json` (+ `.csv`).
"""

import argparse
import csv
import json
import os
import sys

import yaml

from scraper import FIELDS, collect_listings


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def save_json(rows: list[dict], path: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)


def save_csv(rows: list[dict], path: str) -> None:
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)


def print_summary(rows: list[dict]) -> None:
    total = len(rows)
    if not total:
        print("\nNo listings scraped.")
        return
    sale = sum(1 for r in rows if r.get("listing_type") == "sale")
    rent = total - sale
    priced = sum(1 for r in rows if r.get("price"))
    with_area = sum(1 for r in rows if r.get("area_sqft"))
    with_geo = sum(1 for r in rows if r.get("lat") and r.get("lng"))
    with_bhk = sum(1 for r in rows if r.get("bhk"))

    localities: dict[str, int] = {}
    for r in rows:
        loc = r.get("locality") or "(unknown)"
        localities[loc] = localities.get(loc, 0) + 1
    top = sorted(localities.items(), key=lambda kv: -kv[1])[:10]

    print(f"\n{'=' * 55}")
    print(f"  Total listings : {total}  (sale {sale} / rent {rent})")
    print(f"  With price     : {priced}  ({priced / total * 100:.0f}%)")
    print(f"  With BHK        : {with_bhk}  ({with_bhk / total * 100:.0f}%)")
    print(f"  With area       : {with_area}  ({with_area / total * 100:.0f}%)")
    print(f"  With lat/lng    : {with_geo}  ({with_geo / total * 100:.0f}%)")
    print(f"  Localities      : {len(localities)}")
    print(f"  Top localities  : " + ", ".join(f"{k} ({v})" for k, v in top))
    print(f"{'=' * 55}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Backporch MagicBricks scraper")
    parser.add_argument("--config", default="config.yml")
    args = parser.parse_args()

    cfg = load_config(args.config)
    out_cfg = cfg.get("output", {})
    out_dir = out_cfg.get("dir", "output").rstrip("/\\")
    out_fmt = out_cfg.get("format", "json")

    os.makedirs(out_dir, exist_ok=True)

    rows = [listing.model_dump() for listing in collect_listings(cfg)]

    if out_fmt in ("json", "both"):
        path = os.path.join(out_dir, "results.json")
        save_json(rows, path)
        print(f"\nSaved -> {path}")
    if out_fmt in ("csv", "both"):
        path = os.path.join(out_dir, "results.csv")
        save_csv(rows, path)
        print(f"Saved -> {path}")

    print_summary(rows)

    if not rows:
        sys.exit(1)


if __name__ == "__main__":
    main()
