"""
services/scraper.py — Arbeitnow API
Free, no auth, reliable for cloud-hosted backends (RemoteOK blocks many cloud IPs).
https://www.arbeitnow.com/api/job-board-api
"""

import time
import logging
from typing import List, Dict
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

ARBEITNOW_API = "https://www.arbeitnow.com/api/job-board-api"


def fetch_arbeitnow_jobs(query: str = "", max_results: int = 25) -> List[Dict]:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)"}
    query_lower = query.lower()

    jobs = []
    page = 1

    while len(jobs) < max_results and page <= 5:
        try:
            resp = requests.get(ARBEITNOW_API, params={"page": page}, headers=headers, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            logger.error(f"Arbeitnow fetch error (page {page}): {e}")
            break

        listings = data.get("data", [])
        if not listings:
            break

        for item in listings:
            title = item.get("title", "")
            description = item.get("description", "")
            tags = " ".join(item.get("tags", []))
            combined = f"{title} {tags} {description}".lower()

            if query_lower and not any(word in combined for word in query_lower.split()):
                continue

            created_ts = item.get("created_at")
            try:
                posted = datetime.fromtimestamp(created_ts, tz=timezone.utc) if created_ts else datetime.now(timezone.utc)
            except Exception:
                posted = datetime.now(timezone.utc)

            jobs.append({
                "title": title,
                "company": item.get("company_name", "Unknown"),
                "location": item.get("location", "Remote") or "Remote",
                "url": item.get("url", ""),
                "description": _strip_html(description)[:1000],
                "posted_date": posted,
                "source": "arbeitnow",
            })

            if len(jobs) >= max_results:
                break

        page += 1
        time.sleep(0.3)

    logger.info(f"Arbeitnow: {len(jobs)} jobs for '{query}'")
    return jobs


def _strip_html(raw: str) -> str:
    if not raw:
        return ""
    return " ".join(BeautifulSoup(raw, "lxml").get_text(separator=" ").split())


def scrape_jobs(queries: List[str], location: str = "", max_per_query: int = 25) -> List[Dict]:
    all_jobs = []
    seen_urls = set()

    for query in queries:
        jobs = fetch_arbeitnow_jobs(query, max_per_query)
        for job in jobs:
            if job["url"] and job["url"] not in seen_urls:
                seen_urls.add(job["url"])
                all_jobs.append(job)
        time.sleep(0.5)

    return all_jobs
