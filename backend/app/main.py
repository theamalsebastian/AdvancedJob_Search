from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.config import FRONTEND_URL
from app.routers import jobs, resume, ats, chat, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Job Search Assistant API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://advanced-job-search.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(chat.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Job Search Assistant API"}


@app.get("/health")
def health():
    return {"status": "healthy"}

