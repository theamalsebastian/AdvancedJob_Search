"""
services/scraper.py — RemoteOK version
Free JSON API, no auth.
https://remoteok.com/api
"""

import time
import logging
from typing import List, Dict
from datetime import datetime, timezone

import requests

logger = logging.getLogger(__name__)

REMOTEOK_API = "https://remoteok.com/api"


def fetch_remoteok_jobs(query: str = "", max_results: int = 25) -> List[Dict]:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)"}

    try:
        resp = requests.get(REMOTEOK_API, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"RemoteOK fetch error: {e}")
        return []

    listings = [d for d in data if isinstance(d, dict) and d.get("id")]

    query_lower = query.lower()
    jobs = []
    for item in listings:
        title = item.get("position", "")
        tags = " ".join(item.get("tags", []))
        description = item.get("description", "")
        combined = f"{title} {tags} {description}".lower()

        if query_lower and not any(word in combined for word in query_lower.split()):
            continue

        posted_ts = item.get("date")
        try:
            posted = datetime.fromisoformat(posted_ts.replace("Z", "+00:00")) if posted_ts else datetime.now(timezone.utc)
        except Exception:
            posted = datetime.now(timezone.utc)

        jobs.append({
            "title": title,
            "company": item.get("company", "Unknown"),
            "location": item.get("location", "Remote") or "Remote",
            "url": item.get("url", f"https://remoteok.com/remote-jobs/{item.get('id','')}"),
            "description": _strip_html(description)[:1000],
            "posted_date": posted,
            "source": "remoteok",
        })

        if len(jobs) >= max_results:
            break

    logger.info(f"RemoteOK: {len(jobs)} jobs for '{query}'")
    return jobs


def _strip_html(raw: str) -> str:
    if not raw:
        return ""
    from bs4 import BeautifulSoup
    return " ".join(BeautifulSoup(raw, "lxml").get_text(separator=" ").split())


def scrape_jobs(queries: List[str], location: str = "", max_per_query: int = 25) -> List[Dict]:
    all_jobs = []
    seen_urls = set()

    for query in queries:
        jobs = fetch_remoteok_jobs(query, max_per_query)
        for job in jobs:
            if job["url"] and job["url"] not in seen_urls:
                seen_urls.add(job["url"])
                all_jobs.append(job)
        time.sleep(0.5)

    return all_jobs
