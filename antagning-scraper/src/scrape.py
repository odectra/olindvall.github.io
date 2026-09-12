#!/usr/bin/env python3
"""Scrape course listings from antagning.se's internal search API.

Strictly for personal, non-commercial analysis, at a deliberately gentle
pace (one request every 300-500 ms, 3 retries max with backoff, a clear
User-Agent identifying the request as personal research). See README.md.

This script is config-driven because the exact endpoint, query parameters
and JSON field names must first be found by hand with tools/discover_api.py
(robots.txt blocks generic automated discovery, so that step needs a real
browser session -- see docs/API_DISCOVERY.md). Fill in config/api_config.json
(copy it from config/api_config.example.json) before running this for real.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

import requests

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "config" / "api_config.json"
DEFAULT_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DEFAULT_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

USER_AGENT = (
    "olindvall-personal-research/1.0 "
    "(+contact: osvensson91@gmail.com; personal, non-commercial, rate-limited)"
)

MAX_RETRIES = 3
MIN_DELAY_S = 0.3
MAX_DELAY_S = 0.5


def get_by_path(obj: Any, path: str) -> Any:
    """Look up a dotted path like 'provider.name' in nested dicts/lists."""
    current = obj
    for part in path.split("."):
        if current is None:
            return None
        if isinstance(current, list):
            try:
                current = current[int(part)]
            except (ValueError, IndexError):
                return None
        elif isinstance(current, dict):
            current = current.get(part)
        else:
            return None
    return current


@dataclass
class ApiConfig:
    base_url: str
    search_path: str
    method: str
    static_query_params: dict
    pagination: dict
    results_key: str
    total_key: str
    field_map: dict

    @classmethod
    def load(cls, path: Path) -> "ApiConfig":
        if not path.exists():
            raise SystemExit(
                f"Missing {path}.\n\n"
                "Copy config/api_config.example.json to config/api_config.json and fill in\n"
                "the real endpoint, query params and field names found with\n"
                "tools/discover_api.py -- see docs/API_DISCOVERY.md."
            )
        data = json.loads(path.read_text())
        field_map = {k: v for k, v in data.get("field_map", {}).items() if not k.startswith("_")}
        return cls(
            base_url=data["base_url"],
            search_path=data["search_api_path"],
            method=data.get("method", "GET"),
            static_query_params=data.get("static_query_params", {}),
            pagination=data["pagination"],
            results_key=data["response"]["results_key"],
            total_key=data["response"]["total_key"],
            field_map=field_map,
        )


def build_params(cfg: ApiConfig, page_index: int) -> dict:
    params = dict(cfg.static_query_params)
    style = cfg.pagination["style"]
    size = cfg.pagination.get("page_size", 50)
    if style == "offset_limit":
        params[cfg.pagination["offset_param"]] = page_index * size
        params[cfg.pagination["limit_param"]] = size
    elif style == "page_number":
        first = cfg.pagination.get("first_page_index", 0)
        params[cfg.pagination["page_param"]] = page_index + first
        params[cfg.pagination.get("limit_param", "pageSize")] = size
    elif style == "cursor":
        pass  # cursor is threaded through in iter_pages instead
    else:
        raise ValueError(f"Unknown pagination style: {style!r}")
    return params


def fetch_page(session: requests.Session, cfg: ApiConfig, params: dict) -> dict:
    url = cfg.base_url.rstrip("/") + cfg.search_path
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.request(cfg.method, url, params=params, timeout=20)
            resp.raise_for_status()
            return resp.json()
        except (requests.RequestException, json.JSONDecodeError) as exc:
            last_exc = exc
            if attempt < MAX_RETRIES:
                backoff = (2 ** (attempt - 1)) + random.uniform(0, 0.5)
                print(f"  request failed ({exc}); retry {attempt}/{MAX_RETRIES} in {backoff:.1f}s", file=sys.stderr)
                time.sleep(backoff)
    raise RuntimeError(f"Failed to fetch {url} with params={params}") from last_exc


def iter_pages(cfg: ApiConfig, raw_dir: Path, max_pages: int | None) -> Iterator[dict]:
    raw_dir.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT
    session.headers["Accept"] = "application/json"

    cursor = None
    page_index = 0
    total: int | None = None
    fetched = 0

    while True:
        if max_pages is not None and page_index >= max_pages:
            break

        cache_path = raw_dir / f"page_{page_index:04d}.json"
        if cache_path.exists():
            payload = json.loads(cache_path.read_text())
            print(f"page {page_index}: cached ({cache_path.name})")
        else:
            if cfg.pagination["style"] == "cursor":
                params = dict(cfg.static_query_params)
                if cursor is not None:
                    params[cfg.pagination["cursor_param"]] = cursor
            else:
                params = build_params(cfg, page_index)

            payload = fetch_page(session, cfg, params)
            cache_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
            print(f"page {page_index}: fetched and cached ({cache_path.name})")
            time.sleep(random.uniform(MIN_DELAY_S, MAX_DELAY_S))

        hits = get_by_path(payload, cfg.results_key) or []
        if total is None:
            total = get_by_path(payload, cfg.total_key)
            if total is not None:
                print(f"total hits reported by API: {total}")

        yield payload

        fetched += len(hits)
        page_index += 1

        if cfg.pagination["style"] == "cursor":
            cursor = payload.get(cfg.pagination.get("next_cursor_key", "nextCursor"))
            if not cursor:
                break
        else:
            if not hits:
                break
            if total is not None and fetched >= total:
                break


def normalize(pages: list[dict], cfg: ApiConfig) -> list[dict]:
    rows = []
    for payload in pages:
        hits = get_by_path(payload, cfg.results_key) or []
        for hit in hits:
            rows.append({column: get_by_path(hit, path) for column, path in cfg.field_map.items()})
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_PATH)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_PROCESSED_DIR)
    parser.add_argument("--max-pages", type=int, default=None, help="Stop after N pages (useful while testing config)")
    parser.add_argument("--format", choices=["csv", "parquet", "both"], default="both")
    args = parser.parse_args()

    cfg = ApiConfig.load(args.config)

    pages = list(iter_pages(cfg, args.raw_dir, args.max_pages))
    rows = normalize(pages, cfg)
    print(f"Normalized {len(rows)} courses from {len(pages)} pages")

    import pandas as pd

    args.out_dir.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(rows)

    if args.format in ("csv", "both"):
        csv_path = args.out_dir / "courses.csv"
        df.to_csv(csv_path, index=False)
        print(f"Wrote {csv_path}")
    if args.format in ("parquet", "both"):
        parquet_path = args.out_dir / "courses.parquet"
        df.to_parquet(parquet_path, index=False)
        print(f"Wrote {parquet_path}")


if __name__ == "__main__":
    main()
