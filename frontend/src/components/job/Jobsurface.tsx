"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Loader2, ExternalLink, MapPin, Calendar } from "lucide-react";
import { listJobs, searchJobs, scrapeJobs, Job } from "@/lib/api";
import { MatchDial } from "./Primitives";
import { EmptyState, ErrorState } from "./States";

function JobCard({ job, score }: { job: Job; score?: number }) {
  return (
    <article className="tile tile-hover settle group flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground leading-snug">{job.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
        </div>
        {score !== undefined && <MatchDial value={Math.round(score * 100)} size={44} />}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
        )}
        {job.posted_date && (
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{job.posted_date.slice(0, 10)}</span>
        )}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium">{job.source}</span>
      </div>
      {job.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
      )}
      {job.url && (
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-clay transition-colors hover:text-clay-soft">
          View posting <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </article>
  );
}

export function JobsSurface() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(false);

  async function loadJobs() {
    setLoading(true); setError(false);
    try {
      const data = await listJobs(50);
      setJobs(data); setScores({});
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  async function handleSearch() {
    if (!query.trim()) return loadJobs();
    setLoading(true); setError(false);
    try {
      const data = await searchJobs(query, 12);
      setJobs(data.results.map((r) => r.job));
      const s: Record<string, number> = {};
      data.results.forEach((r) => (s[r.job.url] = r.score));
      setScores(s);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  async function handleRefresh() {
    setScraping(true);
    try {
      await scrapeJobs(["python", "developer", "engineer"], "", 10);
      await loadJobs();
    } finally { setScraping(false); }
  }

  useEffect(() => { loadJobs(); }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Job board</h1>
          <p className="mt-1 text-muted-foreground">Search live postings with semantic matching</p>
        </div>
        <button onClick={handleRefresh} disabled={scraping}
          className="tile tile-hover flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
          {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh listings
        </button>
      </div>

      <div className="mb-8 flex gap-2">
        <div className="tile relative flex-1 rounded-full border border-border">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by role, skill, or company…"
            className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
        <button onClick={handleSearch}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
        </div>
      ) : error ? (
        <ErrorState message="Couldn't load jobs. Is the backend running?" />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs indexed yet"
          description="Click Refresh listings to pull in fresh postings from the job board."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {jobs.map((job, i) => (
            <JobCard key={job.url || i} job={job} score={scores[job.url]} />
          ))}
        </div>
      )}
    </div>
  );
}
