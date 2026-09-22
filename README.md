# Backporch

A property search assistant that scrapes listings from multiple sources for Kolkata. Listings are scraped on a schedule
(currently only from [MagicBricks](https://www.magicbricks.com), with more sources
to be added) into a shared Postgres database. A chat-driven onboarding flow builds
a structured preference profile for each user, then surfaces listings two
ways: **Discover** (random, filtered by locality) and **Matches** (a RAG
pipeline: vector search retrieves candidates, then Gemini re-ranks and
explains them against the full profile).

## The problem

Searching for a place to rent or buy involves manually
combing through listing portals, re-entering the same filters on each one,
and reading through dozens of near-identical descriptions to figure out
which listings actually fit what you want. The project centralizes listings from multiple portals into one place
and uses a conversational profile plus a RAG pipeline (embeddings for
retrieval, an LLM for reasoning) to do the filtering and matching.

## Structure

- **`app/`**: the Next.js app (App Router). Web UI, API routes, direct
  Postgres access, and LLM orchestration (Google Gemini via the Vercel AI SDK
  and `@google/genai`). Auth is handled by Supabase.
- **`ingest/`**: a Python pipeline that scrapes MagicBricks for Kolkata
  listings, normalizes them, embeds changed listings with Gemini, and syncs
  everything into the same Postgres database `app/` reads from.

## Architecture

```mermaid
flowchart LR
    subgraph ingest["ingest/ (Python, scheduled daily)"]
        scrape["Scrape MagicBricks"]
        normalize["Normalize listings"]
        embed_ingest["Embed changed listings\n(Gemini)"]
        scrape --> normalize --> embed_ingest
    end

    subgraph db["Postgres (Supabase)"]
        listings[("listings\n+ pgvector embeddings")]
        profiles[("profiles")]
        convos[("conversations / messages")]
    end

    embed_ingest -->|upsert| listings

    subgraph app["app/ (Next.js)"]
        chat["/chat\nonboarding + ongoing prefs"]
        discover["/discover\nrandom, locality-filtered"]
        matches["/matches\nvector search + LLM re-rank"]
    end

    user(("User")) --> chat
    user --> discover
    user --> matches

    chat -->|updateProfile via Gemini| profiles
    chat --> convos
    discover -->|read, filter by locality| listings
    matches -->|embed soft_prefs, match_listings()| listings
    matches -.->|reads| profiles
    discover -.->|reads| profiles
```

## How it fits together

1. A new user is onboarded through `/chat`: the assistant asks about one
   missing profile field at a time (rent vs. sale, budget, BHK, localities,
   soft preferences) until the profile is complete. Onboarding is enforced:
   the rest of the app is gated behind a complete profile.
2. Once onboarding is done, **Discover** and **Matches** read listings from
   the `listings` table that `ingest/` keeps populated.
   - Discover: a random sample filtered only by the profile's localities.
   - Matches: an embedding of the user's soft preferences is compared against
     listing embeddings (pgvector), hard-filtered by budget/BHK/locality, then
     the top candidates are re-ranked and explained by an LLM call.
3. `ingest/` runs independently of the app, on a schedule
   (`.github/workflows/ingest.yml`), to keep the `listings` table fresh.

## Running the app (`app/`)

```bash
cd app
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

Required environment variables (`app/.env`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (auth) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (auth) |
| `DATABASE_URL` | Direct Postgres connection string, used by route handlers for everything besides auth |
| `GEMINI_API_KEY` | Read by `@google/genai` (embeddings) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Read by `@ai-sdk/google` (chat/profile generation); same key value as `GEMINI_API_KEY`, just a different SDK's expected variable name |

If deploying somewhere with restricted outbound IPv6 (GitHub Actions
runners, some serverless platforms), use Supabase's **Transaction pooler**
connection string for `DATABASE_URL` rather than the direct connection: the
direct connection resolves to an IPv6-only address on newer Supabase
projects.

## Running the ingest pipeline (`ingest/`)

```bash
cd ingest
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and GEMINI_API_KEY
python ingest.py       # scrape -> upsert -> embed changed rows -> deactivate/purge stale rows
```

Useful flags: `--config config.yml`, `--grace-days 3`, `--retention-days 30`,
`--dry-run` (scrape and report without touching the database).

`python scrape.py` runs just the scrape step and writes `output/results.json`
(and/or `.csv`, per `config.yml`), without touching the database. Useful for
inspecting scraper output on its own.

### Scheduled runs

`.github/workflows/ingest.yml` runs `ingest.py` daily via GitHub Actions
(`workflow_dispatch` is also enabled for manual runs). It needs two repository
secrets set under **Settings -> Secrets and variables -> Actions**:

- `DATABASE_URL` (use the Transaction pooler connection string, see above)
- `GEMINI_API_KEY`

## Database schema

`ingest/db/schema.sql` is idempotent (safe to run repeatedly) and defines:

- `listings`: scraped property facts, source text, and a pgvector embedding
  column, plus the `match_listings` SQL function used by Matches.
- `conversations` / `messages`: chat history per user.
- `profiles`: the structured preference profile built up during onboarding.

Apply it via the Supabase SQL editor or `psql`.

## Data scope and legality

`ingest/` scrapes only factual property data: numbers, categories,
coordinates, timestamps (price, BHK, area, locality, listing/property type,
possession, and similar fields). Titles and descriptions are stored
internally, used only to generate embeddings for search, and are never
returned by the API or shown in the app. Photos, advertiser/owner names, and
contact details are never scraped or stored at all.
