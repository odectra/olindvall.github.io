#!/usr/bin/env python3
"""Find antagning.se's internal search API and capture an example response.

IMPORTANT: run this on your OWN machine with normal internet access -- it
will not work from a network-restricted sandbox/CI environment, since it
needs to reach www.antagning.se directly.

Usage:
    1. In your normal browser, go to antagning.se and set up the search you
       want (distans utan fysisk sammankomst, vårtermin 2027, kurser). Copy
       the resulting URL from the address bar once the filters are applied.
    2. Install deps once: pip install -r requirements.txt && playwright install chromium
    3. Run:
         python tools/discover_api.py --url "<paste the URL here>"
    4. A visible browser window opens (log in if antagning.se asks you to).
       Watch this script's console output: every JSON response is logged
       with its method, status and URL.
    5. In the opened window, scroll down / click "Visa fler" a couple of
       times and watch the console again -- this reveals how the pagination
       parameters (offset/page/cursor) change between requests.
    6. The first response that looks like a real course-listing payload is
       saved automatically to docs/api_example.json.
    7. Use what you learned (endpoint path, query params, pagination style,
       field names) to fill in config/api_config.json -- copy it from
       config/api_config.example.json and edit -- see docs/API_DISCOVERY.md.

This only opens a page and reads responses sent back to your own browser
session; it does not run at any real volume. Bulk, rate-limited fetching
happens later in src/scrape.py.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
EXAMPLE_PATH = DOCS_DIR / "api_example.json"
LOG_PATH = DOCS_DIR / "api_discovery_log.jsonl"

# Heuristic for spotting the real search-results call among all the other
# background XHR/fetch traffic a modern SPA makes.
LIKELY_KEYS = {"hits", "results", "items", "courses", "utbildningar", "total", "totalCount", "totalHits"}


def looks_like_results_payload(data: object) -> bool:
    if isinstance(data, list):
        return len(data) > 0 and isinstance(data[0], dict)
    if isinstance(data, dict):
        return bool(LIKELY_KEYS & set(data.keys()))
    return False


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--url", required=True, help="antagning.se search URL with your filters already applied")
    parser.add_argument("--headless", action="store_true", help="Run headless (default: visible, so you can log in)")
    args = parser.parse_args()

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    saved_example = False

    with sync_playwright() as p, LOG_PATH.open("a", encoding="utf-8") as log_file:
        browser = p.chromium.launch(headless=args.headless)
        context = browser.new_context()
        page = context.new_page()

        def on_response(response) -> None:
            nonlocal saved_example
            ctype = response.headers.get("content-type", "")
            if "application/json" not in ctype:
                return
            try:
                data = response.json()
            except Exception:
                return

            entry = {"method": response.request.method, "status": response.status, "url": response.url}
            print(f"[JSON] {entry['method']} {entry['status']} {entry['url']}")
            log_file.write(json.dumps(entry, ensure_ascii=False) + "\n")
            log_file.flush()

            if not saved_example and looks_like_results_payload(data):
                EXAMPLE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2))
                saved_example = True
                print(f"  -> looks like the results payload, saved to {EXAMPLE_PATH}")

        page.on("response", on_response)

        print(f"Opening {args.url}")
        page.goto(args.url, wait_until="networkidle")

        if not args.headless:
            print(
                "\nBrowser window is open. Log in if prompted, then scroll or click "
                "'Visa fler' a few times to see pagination requests logged here.\n"
                "Press Enter in this terminal when you're done.\n"
            )
            try:
                input()
            except EOFError:
                pass

        browser.close()

    print(f"\nAll observed JSON responses logged to {LOG_PATH}")
    if saved_example:
        print(f"Example results payload saved to {EXAMPLE_PATH}")
    else:
        print(
            "No response automatically matched the results-payload heuristic.\n"
            f"Check {LOG_PATH} by hand, then open the matching URL directly (or re-trigger it)\n"
            "and copy its JSON body into docs/api_example.json yourself."
        )


if __name__ == "__main__":
    main()
