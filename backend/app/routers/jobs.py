from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import time

from app.db.database import get_db
from app.db.models import Job, SearchLog
from app.schemas import ScrapeRequest, ScrapeResponse, SearchRequest, SearchResponse, SearchResult, JobOut
from app.services.scraper import scrape_jobs
from app.vectorstore.qdrant_client import upsert_jobs, semantic_search, hybrid_search, collection_stats
from app.services.reranker import rerank

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/scrape", response_model=ScrapeResponse)
def scrape_and_index(req: ScrapeRequest, db: Session = Depends(get_db)):
    jobs = scrape_jobs(req.queries, req.location, req.max_per_query)
    if not jobs:
        return ScrapeResponse(total_scraped=0, total_indexed=0)

    point_ids = upsert_jobs(jobs)

    indexed = 0
    for job, pid in zip(jobs, point_ids):
        existing = db.query(Job).filter(Job.url == job["url"]).first()
        if existing:
            continue
        db_job = Job(
            title=job["title"], company=job["company"], location=job["location"],
            description=job["description"], url=job["url"], source=job["source"],
            posted_date=job["posted_date"], qdrant_id=pid,
        )
        db.add(db_job)
        indexed += 1

    db.commit()
    return ScrapeResponse(total_scraped=len(jobs), total_indexed=indexed)


@router.post("/search", response_model=SearchResponse)
def search_jobs(req: SearchRequest, db: Session = Depends(get_db)):
    t0 = time.time()

    if req.use_hybrid:
        candidates = hybrid_search(req.query, top_k=req.top_k * 3 if req.use_rerank else req.top_k)
    else:
        candidates = semantic_search(req.query, top_k=req.top_k * 3 if req.use_rerank else req.top_k)

    if req.use_rerank and candidates:
        results = rerank(req.query, candidates, top_k=req.top_k)
    else:
        results = candidates[:req.top_k]

    retrieval_ms = int((time.time() - t0) * 1000)

    log = SearchLog(query=req.query, result_count=len(results), response_time_ms=retrieval_ms)
    db.add(log)
    db.commit()

    search_results = [
        SearchResult(
            job=JobOut(
                title=job.get("title", ""), company=job.get("company", ""),
                location=job.get("location", ""), description=job.get("description", ""),
                url=job.get("url", ""), source=job.get("source", ""),
                posted_date=job.get("posted_date", ""),
            ),
            score=score,
        )
        for job, score in results
    ]

    return SearchResponse(results=search_results, retrieval_ms=retrieval_ms)


@router.get("/list", response_model=List[JobOut])
def list_jobs(limit: int = 50, source: str = None, db: Session = Depends(get_db)):
    q = db.query(Job).order_by(Job.posted_date.desc())
    if source:
        q = q.filter(Job.source == source)
    jobs = q.limit(limit).all()

    return [
        JobOut(title=j.title, company=j.company, location=j.location, description=j.description,
               url=j.url, source=j.source, posted_date=str(j.posted_date))
        for j in jobs
    ]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_jobs = db.query(func.count(Job.id)).scalar()
    by_source = dict(db.query(Job.source, func.count(Job.id)).group_by(Job.source).all())
    qdrant_stats = collection_stats()

    return {"total_jobs_postgres": total_jobs, "by_source": by_source, "qdrant": qdrant_stats}