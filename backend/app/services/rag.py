import logging
import time
import re
from typing import Dict, List, Optional, Tuple

from groq import Groq

from app.config import GROQ_API_KEY, LLM_MODEL
from app.vectorstore.qdrant_client import hybrid_search
from app.services.reranker import rerank
from app.services.embedder import SKILL_TO_CATEGORY

logger = logging.getLogger(__name__)
_client: Optional[Groq] = None

SYSTEM_PROMPT = """You are an expert career advisor and job search assistant.
You help users find relevant job opportunities and understand how their skills align with open roles.

You have access to a curated set of job postings retrieved for the user's query via hybrid search + reranking.
Always ground your answers in the provided job data. Be specific, honest, and actionable.

When listing jobs:
- Include: title, company, location, and why it's a good match
- Highlight skill matches and gaps concisely
- Keep answers focused and scannable"""


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _job_skills(description: str) -> set:
    text_lower = description.lower()
    found = set()
    for skill in SKILL_TO_CATEGORY:
        if " " in skill:
            if skill in text_lower:
                found.add(skill)
        else:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found.add(skill)
    return found


def _format_context(jobs_with_scores: List[Tuple[Dict, float]], resume_skills: Optional[List[str]] = None) -> str:
    resume_skill_set = set(s.lower() for s in resume_skills) if resume_skills else None
    lines = []

    for i, (job, score) in enumerate(jobs_with_scores, 1):
        lines.append(f"--- Job {i} (relevance: {score:.3f}) ---")
        lines.append(f"Title:    {job.get('title','N/A')}")
        lines.append(f"Company:  {job.get('company','N/A')}")
        lines.append(f"Location: {job.get('location','N/A')}")
        lines.append(f"URL:      {job.get('url','N/A')}")

        desc = job.get("description", "")
        if desc:
            lines.append(f"Description: {desc[:400]}")

        if resume_skill_set:
            job_skill_set = _job_skills(desc + " " + job.get("title", ""))
            matched = sorted(resume_skill_set & job_skill_set)
            missing = sorted(job_skill_set - resume_skill_set)
            match_pct = (len(matched) / len(job_skill_set) * 100) if job_skill_set else 0
            lines.append(f"Skill Match: {match_pct:.0f}%")
            if matched:
                lines.append(f"Matched: {', '.join(matched[:6])}")
            if missing:
                lines.append(f"Missing: {', '.join(missing[:5])}")

        lines.append("")

    return "\n".join(lines)


def query_jobs(user_query: str, resume_skills: Optional[List[str]] = None, top_k: int = 5, use_rerank: bool = True) -> Dict:
    t0 = time.time()

    candidates = hybrid_search(user_query, top_k=top_k * 3 if use_rerank else top_k)

    if use_rerank and candidates:
        jobs_with_scores = rerank(user_query, candidates, top_k=top_k)
    else:
        jobs_with_scores = candidates[:top_k]

    retrieval_ms = int((time.time() - t0) * 1000)

    if not jobs_with_scores:
        return {"answer": "No relevant jobs found. Try refreshing the job index or rephrasing your query.", "jobs": [], "retrieval_ms": retrieval_ms, "llm_ms": 0}

    context = _format_context(jobs_with_scores, resume_skills)
    resume_note = ""
    if resume_skills:
        resume_note = f"\n## My Skills\n{', '.join(resume_skills)}\n"

    user_message = f"{resume_note}\n## Retrieved Jobs\n{context}\n## Question\n{user_query}"

    t1 = time.time()
    client = get_client()
    response = client.chat.completions.create(
        model=LLM_MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
    )
    answer = response.choices[0].message.content
    llm_ms = int((time.time() - t1) * 1000)

    return {"answer": answer, "jobs": [job for job, _ in jobs_with_scores], "retrieval_ms": retrieval_ms, "llm_ms": llm_ms}