-- Backporch listings store. Apply in the Supabase SQL editor (or via psql).
-- Idempotent: safe to run repeatedly.

create extension if not exists vector;

create table if not exists listings (
    -- identity
    source             text not null,
    source_id          text not null,
    url                text,
    primary key (source, source_id),

    -- source text: for embedding and LLM ranking, not for verbatim display
    title              text,
    description        text,

    -- facts
    price              bigint,
    price_display      text,
    price_per_sqft     double precision,
    bhk                int,
    bathrooms          int,
    balconies          int,
    area_sqft          double precision,
    carpet_area_sqft   double precision,
    area_unit          text,
    locality           text,
    city               text not null default 'Kolkata',
    lat                double precision,
    lng                double precision,
    furnishing         text,
    listing_type       text,            -- 'sale' | 'rent'
    transaction_type   text,
    property_type      text,
    possession         text,
    project_name       text,
    tenant_preference  text,
    rera               text,
    posted_at          timestamptz,

    -- embedding
    embedding          vector(768),
    embedded_text_hash text,            -- sha256 of the text last embedded

    -- lifecycle
    is_active          boolean not null default true,
    first_seen_at      timestamptz not null default now(),
    last_seen_at       timestamptz not null default now(),
    scraped_at         timestamptz
);

create index if not exists listings_active_type_idx on listings (is_active, listing_type);
create index if not exists listings_locality_idx    on listings (locality);
create index if not exists listings_price_idx       on listings (price);
create index if not exists listings_embedding_idx
    on listings using hnsw (embedding vector_cosine_ops);


-- Similarity search with hard filters. Used by the app layer (not yet built).
create or replace function match_listings(
    query_embedding      vector(768),
    match_count          int    default 20,
    filter_listing_type  text   default null,
    max_price            bigint default null,
    min_bhk              int    default null,
    localities           text[] default null
)
returns setof listings
language sql stable
as $$
    select *
    from listings
    where is_active
      and (filter_listing_type is null or listing_type = filter_listing_type)
      and (max_price is null or price <= max_price)
      and (min_bhk is null or bhk >= min_bhk)
      and (localities is null or locality = any (localities))
    order by embedding <=> query_embedding
    limit match_count;
$$;
