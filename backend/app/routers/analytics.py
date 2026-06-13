from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from datetime import datetime, timedelta

from app.db.database import get_db
from app.db.models import Job, Resume, SearchLog
from app.schemas import AnalyticsOut
from app.services.embedder import SKILL_TO_CATEGORY
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(db: Session = Depends(get_db)):
    total_jobs = db.query(func.count(Job.id)).scalar() or 0
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_searches = db.query(func.count(SearchLog.id)).scalar() or 0
    avg_response_time = db.query(func.avg(SearchLog.response_time_ms)).scalar() or 0

    by_source = dict(db.query(Job.source, func.count(Job.id)).group_by(Job.source).all())

    jobs = db.query(Job.description).limit(500).all()
    skill_counter = Counter()
    for (desc,) in jobs:
        if not desc:
            continue
        desc_lower = desc.lower()
        for skill in SKILL_TO_CATEGORY:
            if skill in desc_lower:
                skill_counter[skill] += 1

    top_skills = [
        {"skill": skill, "count": count, "category": SKILL_TO_CATEGORY.get(skill, "tools")}
        for skill, count in skill_counter.most_common(15)
    ]

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    searches = (
        db.query(func.date(SearchLog.created_at).label("date"), func.count(SearchLog.id).label("count"))
        .filter(SearchLog.created_at >= seven_days_ago)
        .group_by(func.date(SearchLog.created_at))
        .all()
    )
    searches_over_time = [{"date": str(d), "count": c} for d, c in searches]

    return AnalyticsOut(
        total_jobs=total_jobs, total_resumes=total_resumes, total_searches=total_searches,
        avg_response_time_ms=round(float(avg_response_time), 1), top_skills_in_demand=top_skills,
        jobs_by_source=by_source, searches_over_time=searches_over_time,
    )