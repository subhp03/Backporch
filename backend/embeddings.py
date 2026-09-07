"""
Gemini text embeddings.

Uses `text-embedding-004` (768-dim). Ingest embeds listings as
RETRIEVAL_DOCUMENT; the query side (not built yet) uses RETRIEVAL_QUERY.
Free tier is ~1500 requests/day, 100 texts/request.
"""

import os
import time

from google import genai
from google.genai import types

MODEL = "text-embedding-004"
DIM = 768
BATCH = 100

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=key)
    return _client


def _embed_batch(texts: list[str], task_type: str, retries: int = 4) -> list[list[float]]:
    client = _get_client()
    config = types.EmbedContentConfig(task_type=task_type, output_dimensionality=DIM)
    for attempt in range(1, retries + 1):
        try:
            resp = client.models.embed_content(
                model=MODEL, contents=texts, config=config
            )
            return [list(e.values) for e in resp.embeddings]
        except Exception as e:  # noqa: BLE001 - retry on any transient API error
            if attempt == retries:
                raise
            wait = 5 * attempt
            print(f"  embed retry {attempt}/{retries} after error ({e}); sleeping {wait}s")
            time.sleep(wait)
    return []  # unreachable


def embed_documents(texts: list[str]) -> list[list[float]]:
    """Embed listing texts (RETRIEVAL_DOCUMENT). Returns one 768-float vector each."""
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH):
        out.extend(_embed_batch(texts[i:i + BATCH], "RETRIEVAL_DOCUMENT"))
    return out


def embed_query(text: str) -> list[float]:
    """Embed a single search query (RETRIEVAL_QUERY)."""
    return _embed_batch([text], "RETRIEVAL_QUERY")[0]
