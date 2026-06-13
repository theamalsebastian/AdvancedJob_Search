from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.config import FRONTEND_URL
from app.routers import jobs, resume, ats, chat, analytics

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Job Search Assistant API",
    description="RAG-powered career agent — hybrid search, ATS scoring, resume matching",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(resume.router)
app.include_router(ats.router)
app.include_router(chat.router)
app.include_router(analytics.router)


@app.on_event("startup")
def preload_models():
    """Load embedding model at startup, not on first request — avoids
    request-timeout (Render free tier proxy gives ~60-100s max per request,
    but model download can take longer on cold instances)."""
    import logging
    logger = logging.getLogger("startup")
    try:
        from app.vectorstore.qdrant_client import get_embedder
        logger.info("Preloading sentence-transformers model...")
        get_embedder()
        logger.info("Embedding model loaded.")
    except Exception as e:
        logger.error(f"Model preload failed: {e}")


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Job Search Assistant API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
