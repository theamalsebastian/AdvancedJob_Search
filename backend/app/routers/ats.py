from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume, ATSScore, Job
from app.schemas import ATSRequest, ATSResponse
from app.services.ats_scorer import calculate_ats_score
from app.services.embedder import detect_sections

router = APIRouter(prefix="/api/ats", tags=["ats"])


@router.post("/score", response_model=ATSResponse)
def score_resume(req: ATSRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    sections = detect_sections(resume.raw_text)
    result = calculate_ats_score(
        raw_text=resume.raw_text, sections=sections, resume_skills=resume.all_skills,
        job_description=req.job_description or "",
    )

    ats_record = ATSScore(
        resume_id=resume.id, match_score=result["overall_score"],
        keyword_score=result["keyword_match"]["score"] if result["keyword_match"] else 0,
        formatting_score=result["formatting"]["score"], section_score=result["sections"]["score"],
        matched_skills=result["keyword_match"]["matched_keywords"] if result["keyword_match"] else [],
        missing_skills=result["keyword_match"]["missing_keywords"] if result["keyword_match"] else [],
        suggestions=result["suggestions"],
    )
    db.add(ats_record)
    db.commit()

    return ATSResponse(**result)


@router.post("/score-against-job/{job_id}", response_model=ATSResponse)
def score_against_job(resume_id: int, job_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if not resume or not job:
        raise HTTPException(404, "Resume or job not found")

    sections = detect_sections(resume.raw_text)
    result = calculate_ats_score(raw_text=resume.raw_text, sections=sections, resume_skills=resume.all_skills, job_description=job.description)

    return ATSResponse(**result)