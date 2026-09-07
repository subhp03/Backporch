"""
Gemini text embeddings.

Uses `gemini-embedding-001`, truncated to 768 dims to match the DB schema.
Ingest embeds listings as RETRIEVAL_DOCUMENT; the query side (not built yet)
uses RETRIEVAL_QUERY.

Free tier is 100 embed requests/minute. `embed_documents` batches (up to 100
texts/request) and paces itself to stay under that.
"""

import os
import time

from google import genai
from google.genai import types

MODEL = "gemini-embedding-001"
DIM = 768
BATCH = 100
PACE_SECONDS = 1.0  # gap between batch requests; 100 texts/req keeps us well under 100/min

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(
            api_key=key,
            http_options=types.HttpOptions(
                retry_options=types.HttpRetryOptions(
                    attempts=6,
                    initial_delay=2,
                    max_delay=90,
                    http_status_codes=[429, 500, 502, 503, 504],
                )
            ),
        )
    return _client


def _embed_batch(texts: list[str], task_type: str) -> list[list[float]]:
    resp = _get_client().models.embed_content(
        model=MODEL,
        contents=texts,
        config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=DIM),
    )
    return [list(e.values) for e in resp.embeddings]


def embed_documents(texts: list[str]) -> list[list[float]]:
    """Embed listing texts (RETRIEVAL_DOCUMENT). Returns one 768-float vector each."""
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH):
        if i:
            time.sleep(PACE_SECONDS)
        out.extend(_embed_batch(texts[i:i + BATCH], "RETRIEVAL_DOCUMENT"))
    return out


def embed_query(text: str) -> list[float]:
    """Embed a single search query (RETRIEVAL_QUERY)."""
    return _embed_batch([text], "RETRIEVAL_QUERY")[0]
