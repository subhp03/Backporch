"""
Scrape MagicBricks and sync the results into the Supabase `listings` table.

    python ingest.py [--config config.yml] [--grace-days 3]
                     [--retention-days 30] [--dry-run]

Flow: scrape -> upsert (facts + source text) -> embed rows whose text changed
-> deactivate rows not seen past a grace window -> purge rows long inactive.

Env (read from backend/.env if present, else the environment):
    DATABASE_URL    postgresql://... (Supabase, Project Settings -> Database)
    GEMINI_API_KEY  for text-embedding-004
"""

import argparse
import hashlib
import os
import sys
from datetime import datetime, timezone

import psycopg
import yaml
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

from embeddings import embed_documents  # noqa: E402  (after load_dotenv)
from scraper import collect_listings, listing_embed_text  # noqa: E402

# Fact + text columns written on every upsert. `source`/`source_id` are the key.
UPSERT_COLS = [
    "url", "title", "description",
    "price", "price_display", "price_per_sqft",
    "bhk", "bathrooms", "balconies",
    "area_sqft", "carpet_area_sqft", "area_unit",
    "locality", "city", "lat", "lng",
    "furnishing", "listing_type", "transaction_type", "property_type",
    "possession", "project_name", "tenant_preference", "rera",
    "posted_at", "scraped_at",
]


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def upsert_listings(conn, rows: list[dict], run_started: datetime) -> dict:
    """Insert/update every scraped row. Returns {(source, source_id): old_hash|None}."""
    cols = ["source", "source_id", *UPSERT_COLS]
    placeholders = ", ".join(["%s"] * len(cols))
    set_clause = ", ".join(f"{c} = excluded.{c}" for c in UPSERT_COLS)
    sql = f"""
        insert into listings ({", ".join(cols)}, last_seen_at, is_active)
        values ({placeholders}, %s, true)
        on conflict (source, source_id) do update set
            {set_clause},
            last_seen_at = excluded.last_seen_at,
            is_active = true
        returning source, source_id, embedded_text_hash
    """
    old_hashes: dict[tuple[str, str], str | None] = {}
    with conn.cursor() as cur:
        for row in rows:
            values = [row.get(c) for c in cols] + [run_started]
            cur.execute(sql, values)
            r = cur.fetchone()
            old_hashes[(r["source"], r["source_id"])] = r["embedded_text_hash"]
    return old_hashes


EMBED_WRITE_BATCH = 100


def embed_changed(conn, rows: list[dict], old_hashes: dict) -> int:
    """Embed rows whose embed-text hash changed (or was never set). Returns count.

    Writes and commits in batches so a mid-run failure keeps completed work and
    the next run resumes from the unembedded rows.
    """
    pending: list[tuple[tuple[str, str], str, str]] = []  # (key, text, hash)
    for row in rows:
        key = (row["source"], row["source_id"])
        text = listing_embed_text(row)
        h = _text_hash(text)
        if h != old_hashes.get(key):
            pending.append((key, text, h))

    done = 0
    for i in range(0, len(pending), EMBED_WRITE_BATCH):
        chunk = pending[i:i + EMBED_WRITE_BATCH]
        vectors = embed_documents([p[1] for p in chunk])
        with conn.cursor() as cur:
            for (key, _text, h), vec in zip(chunk, vectors):
                cur.execute(
                    "update listings set embedding = %s::vector, embedded_text_hash = %s "
                    "where source = %s and source_id = %s",
                    (str(vec), h, key[0], key[1]),
                )
        conn.commit()
        done += len(chunk)
        print(f"  embedded {done}/{len(pending)}")
    return done


def deactivate_and_purge(conn, run_started: datetime, grace_days: int, retention_days: int):
    with conn.cursor() as cur:
        cur.execute(
            """
            update listings set is_active = false
             where is_active
               and last_seen_at < %s
               and last_seen_at < now() - make_interval(days => %s)
            """,
            (run_started, grace_days),
        )
        deactivated = cur.rowcount
        cur.execute(
            """
            delete from listings
             where not is_active
               and last_seen_at < now() - make_interval(days => %s)
            """,
            (retention_days,),
        )
        purged = cur.rowcount
    return deactivated, purged


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync MagicBricks listings into Supabase")
    parser.add_argument("--config", default="config.yml")
    parser.add_argument("--grace-days", type=int, default=3)
    parser.add_argument("--retention-days", type=int, default=30)
    parser.add_argument("--dry-run", action="store_true",
                        help="scrape and report, touch no DB")
    args = parser.parse_args()

    cfg = load_config(args.config)
    run_started = datetime.now(timezone.utc)

    listings = collect_listings(cfg)
    rows = [listing.model_dump() for listing in listings]
    print(f"\nScraped {len(rows)} listings")

    if not rows:
        print("Nothing scraped, aborting.")
        sys.exit(1)

    if args.dry_run:
        sample = rows[0]
        print("\n[dry-run] would upsert rows like:")
        print({k: sample[k] for k in ("source_id", "listing_type", "price", "bhk", "locality")})
        print("\n[dry-run] embed text for that row:")
        print(listing_embed_text(sample))
        return

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)

    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        # 1. Upsert facts and commit, so a later embed failure doesn't lose the scrape.
        old_hashes = upsert_listings(conn, rows, run_started)
        conn.commit()
        inserted = sum(1 for v in old_hashes.values() if v is None)
        updated = len(old_hashes) - inserted

        # 2. Embed changed rows (committed as they are written; resumable).
        re_embedded = embed_changed(conn, rows, old_hashes)

        # 3. Lifecycle.
        deactivated, purged = deactivate_and_purge(
            conn, run_started, args.grace_days, args.retention_days
        )
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("select count(*) as n from listings where is_active")
            active = cur.fetchone()["n"]

    print(f"\n{'=' * 48}")
    print(f"  scraped      : {len(rows)}")
    print(f"  inserted     : {inserted}")
    print(f"  updated      : {updated}")
    print(f"  re-embedded  : {re_embedded}")
    print(f"  deactivated  : {deactivated}")
    print(f"  purged       : {purged}")
    print(f"  active total : {active}")
    print(f"{'=' * 48}")


if __name__ == "__main__":
    main()
