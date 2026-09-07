"""
HTTP client for the MagicBricks JSON API.

MagicBricks' internal search endpoint (`/mbsrp/propertySearch.html`) returns
clean JSON.
"""

import time

import requests

DESKTOP_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
)


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": DESKTOP_UA,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-IN,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
    })
    return s


def get_json(session: requests.Session, url: str, params: dict,
             retries: int = 3, timeout: int = 25) -> dict | None:
    """GET `url` and parse JSON, retrying with linear backoff on failure."""
    for attempt in range(1, retries + 1):
        try:
            resp = session.get(url, params=params, timeout=timeout)
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code} (attempt {attempt}/{retries})")
                time.sleep(5 * attempt)
                continue
            return resp.json()
        except (requests.RequestException, ValueError) as e:
            print(f"  Request error (attempt {attempt}/{retries}): {e}")
            time.sleep(5 * attempt)
    return None
