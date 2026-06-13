import tempfile
import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume
from app.schemas import ResumeOut
from app.services.embedder import parse_resume, detect_sections
router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/upload", response_model=ResumeOut)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files supported")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        profile = parse_resume(tmp_path)
    finally:
        os.unlink(tmp_path)

    db_resume = Resume(
        filename=file.filename, raw_text=profile["raw_text"], skills=profile["skills_by_category"],
        all_skills=profile["all_skills"], experience_years=profile["experience_years"], contact=profile["contact"],
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return ResumeOut(
        id=db_resume.id, filename=db_resume.filename, skills_by_category=db_resume.skills,
        all_skills=db_resume.all_skills, experience_years=db_resume.experience_years,
        contact=db_resume.contact, skill_count=len(db_resume.all_skills),
    )


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    return ResumeOut(
        id=resume.id, filename=resume.filename, skills_by_category=resume.skills,
        all_skills=resume.all_skills, experience_years=resume.experience_years,
        contact=resume.contact, skill_count=len(resume.all_skills),
    )


@router.get("/{resume_id}/raw-text")
def get_raw_text(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return {"raw_text": resume.raw_text, "sections": detect_sections(resume.raw_text)}