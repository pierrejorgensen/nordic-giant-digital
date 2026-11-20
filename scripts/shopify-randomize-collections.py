#!/usr/bin/env python3
"""
Shuffle product order inside Shopify collection(s) via the Admin GraphQL API.

Requires a custom app (or compatible token) with read_products and write_products.
Set SHOPIFY_STORE (e.g. my-shop.myshopify.com) and SHOPIFY_ADMIN_TOKEN in .env
or the environment.

Only collections sorted as MANUAL keep a fixed order on the storefront; use
--set-manual-sort to switch before shuffling.

Examples:
  python3 scripts/shopify-randomize-collections.py --dry-run
  python3 scripts/shopify-randomize-collections.py --collection-id 123456789
  python3 scripts/shopify-randomize-collections.py --title-contains "Prints"

Hourly fair rotation (manual sort + random order, not newest-first):
  SHOPIFY_ROTATE_COLLECTION_IDS=111,222 python3 scripts/shopify-randomize-collections.py --hourly-rotation
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API_VERSION = "2025-01"
# Homepage manual curation — never shuffle these (case-insensitive title match).
ALWAYS_EXCLUDE_TITLES = frozenset({"weekly highlights"})


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    env_path = ROOT / ".env"
    if env_path.is_file():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    for key in (
        "SHOPIFY_STORE",
        "SHOPIFY_ADMIN_TOKEN",
        "SHOPIFY_ROTATE_COLLECTION_IDS",
        "SHOPIFY_ROTATE_TITLE_CONTAINS",
        "SHOPIFY_ROTATE_EXCLUDE_TITLES",
    ):
        if key in os.environ:
            env[key] = os.environ[key]
    return env


def graphql(store: str, token: str, query: str, variables: dict | None = None) -> dict:
    url = f"https://{store}/admin/api/{API_VERSION}/graphql.json"
    body: dict = {"query": query}
    if variables is not None:
        body["variables"] = variables
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Shopify HTTP {exc.code}: {detail}") from exc

    if payload.get("errors"):
        raise SystemExit(f"GraphQL errors: {payload['errors']}")
    return payload["data"]


def list_collections(store: str, token: str) -> list[dict]:
    query = """
    query Collections($cursor: String) {
      collections(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          title
          sortOrder
          productsCount { count }
        }
      }
    }
    """
    collections: list[dict] = []
    cursor: str | None = None
    while True:
        data = graphql(store, token, query, {"cursor": cursor})
        chunk = data["collections"]
        collections.extend(chunk["nodes"])
        if not chunk["pageInfo"]["hasNextPage"]:
            break
        cursor = chunk["pageInfo"]["endCursor"]
    return collections


def fetch_product_ids(store: str, token: str, collection_id: str) -> list[str]:
    query = """
    query CollectionProducts($id: ID!, $cursor: String) {
      collection(id: $id) {
        products(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id }
        }
      }
    }
    """
    product_ids: list[str] = []
    cursor: str | None = None
    while True:
        data = graphql(store, token, query, {"id": collection_id, "cursor": cursor})
        collection = data.get("collection")
        if not collection:
            return []
        chunk = collection["products"]
        product_ids.extend(node["id"] for node in chunk["nodes"])
        if not chunk["pageInfo"]["hasNextPage"]:
            break
        cursor = chunk["pageInfo"]["endCursor"]
    return product_ids


def set_manual_sort(store: str, token: str, collection_id: str) -> None:
    mutation = """
    mutation SetManual($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id sortOrder }
        userErrors { field message }
      }
    }
    """
    data = graphql(
        store,
        token,
        mutation,
        {"input": {"id": collection_id, "sortOrder": "MANUAL"}},
    )
    errors = data["collectionUpdate"]["userErrors"]
    if errors:
        raise SystemExit(f"collectionUpdate failed: {errors}")


def reorder_products(
    store: str, token: str, collection_id: str, product_ids: list[str]
) -> None:
    moves = [{"id": pid, "newPosition": str(index)} for index, pid in enumerate(product_ids)]
    mutation = """
    mutation Reorder($id: ID!, $moves: [MoveInput!]!) {
      collectionReorderProducts(id: $id, moves: $moves) {
        job { id done }
        userErrors { field message }
      }
    }
    """
    data = graphql(
        store,
        token,
        mutation,
        {"id": collection_id, "moves": moves},
    )
    result = data["collectionReorderProducts"]
    errors = result["userErrors"]
    if errors:
        raise SystemExit(f"collectionReorderProducts failed: {errors}")


def gid_from_numeric_id(numeric_id: str) -> str:
    return f"gid://shopify/Collection/{numeric_id}"


def exclude_title_set(env: dict[str, str], cli_titles: list[str]) -> frozenset[str]:
    titles = set(ALWAYS_EXCLUDE_TITLES)
    extra = env.get("SHOPIFY_ROTATE_EXCLUDE_TITLES", "").strip()
    if extra:
        titles.update(part.strip().casefold() for part in extra.split(",") if part.strip())
    titles.update(part.strip().casefold() for part in cli_titles if part.strip())
    return frozenset(titles)


def without_excluded_titles(collections: list[dict], excluded: frozenset[str]) -> list[dict]:
    if not excluded:
        return collections
    kept: list[dict] = []
    for collection in collections:
        title_key = collection["title"].casefold()
        if title_key in excluded:
            print(f"Exclude {collection['title']!r}: manual curation (not rotated).")
            continue
        kept.append(collection)
    return kept


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--collection-id",
        action="append",
        default=[],
        help="Numeric collection ID (repeatable). Omit to match --title-contains or all.",
    )
    parser.add_argument(
        "--title-contains",
        default="",
        help="Only collections whose title contains this string (case-insensitive).",
    )
    parser.add_argument(
        "--set-manual-sort",
        action="store_true",
        help="Set sort order to MANUAL before shuffling.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducible shuffles (testing).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions without calling write APIs.",
    )
    parser.add_argument(
        "--hourly-rotation",
        action="store_true",
        help=(
            "Unattended rotation: force MANUAL sort, random shuffle, no fixed seed. "
            "Uses SHOPIFY_ROTATE_COLLECTION_IDS or SHOPIFY_ROTATE_TITLE_CONTAINS when "
            "no --collection-id is passed."
        ),
    )
    parser.add_argument(
        "--exclude-title",
        action="append",
        default=[],
        help="Collection title to skip (case-insensitive exact match). Weekly highlights is always excluded.",
    )
    args = parser.parse_args()

    if args.hourly_rotation:
        args.set_manual_sort = True
        if args.seed is not None:
            raise SystemExit("--seed cannot be used with --hourly-rotation.")

    env = load_env()
    store = env.get("SHOPIFY_STORE", "").strip()
    token = env.get("SHOPIFY_ADMIN_TOKEN", "").strip()
    if not store or not token:
        raise SystemExit(
            "Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN in .env or the environment."
        )
    if store.startswith("https://"):
        store = store.removeprefix("https://").rstrip("/")

    if args.seed is not None:
        random.seed(args.seed)

    collection_ids = list(args.collection_id)
    title_contains = args.title_contains

    if args.hourly_rotation and not collection_ids:
        rotate_ids = env.get("SHOPIFY_ROTATE_COLLECTION_IDS", "").strip()
        if rotate_ids:
            collection_ids = [part.strip() for part in rotate_ids.split(",") if part.strip()]
        elif not title_contains:
            rotate_title = env.get("SHOPIFY_ROTATE_TITLE_CONTAINS", "").strip()
            if rotate_title:
                title_contains = rotate_title

    if args.hourly_rotation and not collection_ids and not title_contains:
        raise SystemExit(
            "Hourly rotation needs targets: pass --collection-id, set "
            "SHOPIFY_ROTATE_COLLECTION_IDS, or set SHOPIFY_ROTATE_TITLE_CONTAINS."
        )

    collections = list_collections(store, token)

    if collection_ids:
        wanted = {gid_from_numeric_id(cid) for cid in collection_ids}
        collections = [c for c in collections if c["id"] in wanted]
    elif title_contains:
        needle = title_contains.casefold()
        collections = [c for c in collections if needle in c["title"].casefold()]

    excluded_titles = exclude_title_set(env, args.exclude_title)
    collections = without_excluded_titles(collections, excluded_titles)

    if not collections:
        raise SystemExit("No collections matched.")

    for collection in collections:
        cid = collection["id"]
        title = collection["title"]
        count = collection["productsCount"]["count"]
        sort_order = collection["sortOrder"]

        if count < 2:
            print(f"Skip {title!r}: fewer than 2 products.")
            continue

        if sort_order != "MANUAL" and not args.set_manual_sort:
            print(
                f"Skip {title!r}: sort is {sort_order}, not MANUAL. "
                "Use --set-manual-sort or change sort in admin."
            )
            continue

        product_ids = fetch_product_ids(store, token, cid)
        shuffled = product_ids[:]
        random.shuffle(shuffled)

        print(f"{title!r}: shuffling {len(shuffled)} products ({sort_order}).")

        if args.dry_run:
            continue

        if args.set_manual_sort and sort_order != "MANUAL":
            set_manual_sort(store, token, cid)

        reorder_products(store, token, cid, shuffled)
        print(f"  Done.")


if __name__ == "__main__":
    main()