"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { listJobs, searchJobs, scrapeJobs, Job } from "@/lib/api";
import JobCard from "@/components/JobCard";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [source, setSource] = useState("");

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await listJobs(50, source || undefined);
      setJobs(data);
      setScores({});
    } catch {
      // backend not reachable
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) return loadJobs();
    setLoading(true);
    try {
      const data = await searchJobs(query, 12);
      setJobs(data.results.map((r) => r.job));
      const s: Record<string, number> = {};
      data.results.forEach((r) => (s[r.job.url] = r.score));
      setScores(s);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setScraping(true);
    try {
      await scrapeJobs(
        ["machine learning engineer", "python backend engineer", "data scientist", "AI engineer"],
        "",
        15
      );
      await loadJobs();
    } finally {
      setScraping(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl text-text">Job Pipeline</h1>
          <p className="text-textDim text-sm mt-1">Hybrid search + reranking over indexed postings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={scraping}
          className="flex items-center gap-2 px-3 py-2 rounded border border-border text-sm text-textDim hover:text-text hover:border-accent/40 transition-colors disabled:opacity-50"
        >
          {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh Index
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textDim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search jobs (semantic + keyword hybrid)..."
            className="w-full bg-surface border border-border rounded pl-9 pr-4 py-2.5 text-sm focus:border-accent outline-none placeholder:text-textDim"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-surface border border-border rounded px-3 py-2.5 text-sm text-text focus:border-accent outline-none"
        >
          <option value="">All sources</option>
          <option value="indeed">Indeed</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 rounded bg-accent text-bg font-medium text-sm hover:bg-accentDim transition-colors"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-textDim text-sm font-mono py-8 justify-center">
          <Loader2 size={14} className="animate-spin" /> loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-textDim text-sm">
          No jobs indexed yet. Click <span className="text-accent">Refresh Index</span> to scrape and embed jobs.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {jobs.map((job, i) => (
            <JobCard key={job.url || i} job={job} score={scores[job.url]} />
          ))}
        </div>
      )}
    </div>
  );
}