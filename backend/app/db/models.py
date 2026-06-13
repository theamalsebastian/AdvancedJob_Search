from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String)
    location = Column(String)
    description = Column(Text)
    url = Column(String, unique=True, index=True)
    source = Column(String)
    posted_date = Column(DateTime, default=datetime.utcnow)
    qdrant_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    raw_text = Column(Text)
    skills = Column(JSON)
    all_skills = Column(JSON)
    experience_years = Column(Integer, nullable=True)
    contact = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    ats_scores = relationship("ATSScore", back_populates="resume")


class ATSScore(Base):
    __tablename__ = "ats_scores"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    match_score = Column(Float)
    keyword_score = Column(Float)
    formatting_score = Column(Float)
    section_score = Column(Float)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    suggestions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="ats_scores")


class SearchLog(Base):
    __tablename__ = "search_logs"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String)
    result_count = Column(Integer)
    top_job_id = Column(Integer, nullable=True)
    response_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)