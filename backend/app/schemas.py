from pydantic import BaseModel
from typing import List, Dict, Optional


class JobOut(BaseModel):
    title: str
    company: str
    location: str
    description: str
    url: str
    source: str
    posted_date: Optional[str] = None


class ScrapeRequest(BaseModel):
    queries: List[str]
    location: str = ""
    max_per_query: int = 20


class ScrapeResponse(BaseModel):
    total_scraped: int
    total_indexed: int


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10
    use_hybrid: bool = True
    use_rerank: bool = True


class SearchResult(BaseModel):
    job: JobOut
    score: float


class SearchResponse(BaseModel):
    results: List[SearchResult]
    retrieval_ms: int


class ChatRequest(BaseModel):
    query: str
    resume_id: Optional[int] = None
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    jobs: List[JobOut]
    retrieval_ms: int
    llm_ms: int


class ResumeOut(BaseModel):
    id: int
    filename: str
    skills_by_category: Dict[str, List[str]]
    all_skills: List[str]
    experience_years: Optional[int]
    contact: Dict[str, str]
    skill_count: int

    class Config:
        from_attributes = True


class ATSRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = ""


class ATSResponse(BaseModel):
    overall_score: float
    formatting: Dict
    sections: Dict
    action_verbs: Dict
    quantification: Dict
    keyword_match: Optional[Dict]
    suggestions: List[str]


class AnalyticsOut(BaseModel):
    total_jobs: int
    total_resumes: int
    total_searches: int
    avg_response_time_ms: float
    top_skills_in_demand: List[Dict]
    jobs_by_source: Dict[str, int]
    searches_over_time: List[Dict]