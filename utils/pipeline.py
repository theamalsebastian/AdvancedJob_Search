"""
utils/pipeline.py
Orchestrates scrape → embed → index pipeline.
Run directly to populate the FAISS index from fresh job data.
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from scraper.indeed_scraper import scrape_jobs
from embeddings.faiss_indexer import JobIndex

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

INDEX_PATH = "data/jobs_index"
RAW_JOBS_PATH = "data/raw_jobs.json"


def run_pipeline(
    queries: List[str],
    location: str = "",
    max_per_query: int = 25,
    sources: Optional[List[str]] = None,
    incremental: bool = True,
) -> JobIndex:
    """
    Full pipeline: scrape → deduplicate → embed → index → save.

    Args:
        queries: Search queries to run
        location: Location string
        max_per_query: Jobs per query per source
        sources: ["indeed", "linkedin"] or subset
        incremental: If True and index exists, load and add new jobs only

    Returns:
        Populated JobIndex instance
    """
    if sources is None:
        sources = ["indeed", "linkedin"]

    # ── 1. load or create index ──────────────────────────────────────────────
    if incremental and Path(f"{INDEX_PATH}.index").exists():
        logger.info("Loading existing index for incremental update...")
        idx = JobIndex.load(INDEX_PATH)
        logger.info(f"Existing index: {idx.total} jobs")
    else:
        logger.info("Creating fresh index...")
        idx = JobIndex()

    # ── 2. scrape ────────────────────────────────────────────────────────────
    logger.info(f"Scraping: queries={queries}, location='{location}', sources={sources}")
    jobs = scrape_jobs(
        queries=queries,
        location=location,
        max_per_query=max_per_query,
        sources=sources,
    )
    logger.info(f"Scraped {len(jobs)} raw jobs")

    if not jobs:
        logger.warning("No jobs scraped — check network / queries")
        return idx

    # ── 3. save raw (for debugging / audit) ─────────────────────────────────
    Path("data").mkdir(exist_ok=True)
    existing_raw = []
    if Path(RAW_JOBS_PATH).exists():
        with open(RAW_JOBS_PATH) as f:
            existing_raw = json.load(f)

    merged = {j["url"]: j for j in existing_raw}
    for j in jobs:
        if j.get("url"):
            merged[j["url"]] = j
    with open(RAW_JOBS_PATH, "w") as f:
        json.dump(list(merged.values()), f, indent=2)
    logger.info(f"Raw jobs saved: {len(merged)} total in {RAW_JOBS_PATH}")

    # ── 4. embed + index ─────────────────────────────────────────────────────
    added = idx.add_jobs(jobs)
    logger.info(f"Added {added} new jobs to index (skipped {len(jobs) - added} duplicates)")

    # ── 5. persist ───────────────────────────────────────────────────────────
    idx.save(INDEX_PATH)
    logger.info(f"Index saved. Stats: {idx.stats()}")

    return idx


def load_index() -> Optional[JobIndex]:
    """Load existing index, return None if not found."""
    try:
        return JobIndex.load(INDEX_PATH)
    except FileNotFoundError:
        logger.warning("No saved index found. Run pipeline first.")
        return None


def quick_search(query: str, top_k: int = 5) -> None:
    """CLI helper: load index and print top results for a query."""
    idx = load_index()
    if not idx:
        print("Index not found. Run: python -m utils.pipeline")
        return

    print(f"\nSearching: '{query}' (top {top_k})\n" + "─" * 50)
    results = idx.search(query, top_k=top_k)

    if not results:
        print("No results found.")
        return

    for i, (job, score) in enumerate(results, 1):
        print(f"{i}. [{score:.3f}] {job['title']} @ {job['company']}")
        print(f"   📍 {job['location']}  |  🔗 {job['source']}  |  📅 {job.get('posted_date','')[:10]}")
        print(f"   {job['url']}")
        desc = job.get("description", "")[:150]
        if desc:
            print(f"   {desc}...")
        print()


if __name__ == "__main__":
    import sys

    # Default queries — edit to your target roles
    DEFAULT_QUERIES = [
        "machine learning engineer",
        "python backend engineer",
        "data scientist",
        "MLOps engineer",
        "AI engineer",
    ]

    if len(sys.argv) > 1 and sys.argv[1] == "search":
        query = " ".join(sys.argv[2:]) or "python ML engineer"
        quick_search(query)
    else:
        run_pipeline(
            queries=DEFAULT_QUERIES,
            location="",           # empty = remote/any
            max_per_query=20,
            sources=["indeed"],    # start with indeed only (more reliable)
            incremental=True,
        )
def seed_mock_data():
    """Populate index with mock jobs for UI testing."""
    mock_jobs = [
        {"title": "ML Engineer", "company": "OpenAI", "location": "Remote",
         "url": "https://openai.com/jobs/1", "description": "Python PyTorch transformers LLM RAG FAISS AWS Docker",
         "posted_date": "2026-06-01", "source": "indeed"},
        {"title": "Senior Python Engineer", "company": "Stripe", "location": "San Francisco",
         "url": "https://stripe.com/jobs/2", "description": "Python FastAPI PostgreSQL Redis Kubernetes microservices",
         "posted_date": "2026-06-02", "source": "linkedin"},
        {"title": "Data Scientist", "company": "Airbnb", "location": "Remote",
         "url": "https://airbnb.com/jobs/3", "description": "Python pandas scikit-learn SQL Spark A/B testing",
         "posted_date": "2026-06-03", "source": "indeed"},
        {"title": "MLOps Engineer", "company": "Netflix", "location": "Remote",
         "url": "https://netflix.com/jobs/4", "description": "Python Kubernetes Docker MLflow Airflow AWS SageMaker",
         "posted_date": "2026-06-04", "source": "linkedin"},
        {"title": "AI Engineer", "company": "Google", "location": "New York",
         "url": "https://google.com/jobs/5", "description": "Python TensorFlow JAX LLM fine-tuning Vertex AI GCP",
         "posted_date": "2026-06-05", "source": "indeed"},
        {"title": "Backend Engineer", "company": "Notion", "location": "Remote",
         "url": "https://notion.com/jobs/6", "description": "Python TypeScript FastAPI GraphQL PostgreSQL Redis",
         "posted_date": "2026-06-06", "source": "indeed"},
        {"title": "NLP Engineer", "company": "Hugging Face", "location": "Remote",
         "url": "https://huggingface.com/jobs/7", "description": "Python PyTorch NLP transformers BERT fine-tuning datasets",
         "posted_date": "2026-06-07", "source": "linkedin"},
        {"title": "Data Engineer", "company": "Databricks", "location": "Remote",
         "url": "https://databricks.com/jobs/8", "description": "Python Spark SQL Delta Lake Airflow Kafka dbt AWS",
         "posted_date": "2026-06-08", "source": "indeed"},
    ]
    from embeddings.faiss_indexer import JobIndex
    import json
    from pathlib import Path
    idx = JobIndex()
    idx.add_jobs(mock_jobs)
    Path("data").mkdir(exist_ok=True)
    idx.save("data/jobs_index")
    with open("data/raw_jobs.json", "w") as f:
        json.dump(mock_jobs, f, indent=2)
    print(f"Mock index created: {idx.total} jobs")

if __name__ == "__main__":
    seed_mock_data()