from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume
from app.schemas import ChatRequest, ChatResponse, JobOut
from app.services.rag import query_jobs

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    resume_skills = None
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
        if resume:
            resume_skills = resume.all_skills

    result = query_jobs(user_query=req.query, resume_skills=resume_skills, top_k=req.top_k)

    jobs_out = [
        JobOut(title=j.get("title", ""), company=j.get("company", ""), location=j.get("location", ""),
               description=j.get("description", ""), url=j.get("url", ""), source=j.get("source", ""),
               posted_date=j.get("posted_date", ""))
        for j in result["jobs"]
    ]

    return ChatResponse(answer=result["answer"], jobs=jobs_out, retrieval_ms=result["retrieval_ms"], llm_ms=result["llm_ms"])