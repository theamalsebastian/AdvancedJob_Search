import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  posted_date?: string;
}

export interface ChatResponse {
  answer: string;
  jobs: Job[];
  retrieval_ms: number;
  llm_ms: number;
}

export interface Resume {
  id: number;
  filename: string;
  skills_by_category: Record<string, string[]>;
  all_skills: string[];
  experience_years: number | null;
  contact: Record<string, string>;
  skill_count: number;
}

export interface ATSResult {
  overall_score: number;
  formatting: { score: number; issues: string[] };
  sections: { score: number; found_sections: string[]; missing_sections: string[] };
  action_verbs: { score: number; verbs_found: string[]; verb_count: number };
  quantification: { score: number; metrics_found: string[]; metric_count: number };
  keyword_match: { score: number; matched_keywords: string[]; missing_keywords: string[] } | null;
  suggestions: string[];
}

export interface Analytics {
  total_jobs: number;
  total_resumes: number;
  total_searches: number;
  avg_response_time_ms: number;
  top_skills_in_demand: { skill: string; count: number; category: string }[];
  jobs_by_source: Record<string, number>;
  searches_over_time: { date: string; count: number }[];
}

export async function chatQuery(query: string, resumeId?: number, topK = 5): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>("/api/chat", { query, resume_id: resumeId, top_k: topK });
  return res.data;
}

export async function searchJobs(query: string, topK = 10): Promise<{ results: { job: Job; score: number }[]; retrieval_ms: number }> {
  const res = await api.post("/api/jobs/search", { query, top_k: topK, use_hybrid: true, use_rerank: true });
  return res.data;
}

export async function listJobs(limit = 50, source?: string): Promise<Job[]> {
  const res = await api.get<Job[]>("/api/jobs/list", { params: { limit, source } });
  return res.data;
}

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<Resume>("/api/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function scoreATS(resumeId: number, jobDescription?: string): Promise<ATSResult> {
  const res = await api.post<ATSResult>("/api/ats/score", { resume_id: resumeId, job_description: jobDescription || "" });
  return res.data;
}

export async function getAnalytics(): Promise<Analytics> {
  const res = await api.get<Analytics>("/api/analytics");
  return res.data;
}

export async function scrapeJobs(queries: string[], location = "", maxPerQuery = 20) {
  const res = await api.post("/api/jobs/scrape", { queries, location, max_per_query: maxPerQuery });
  return res.data;
}