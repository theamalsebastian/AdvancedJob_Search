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
      await scrapeJobs(["python", "developer", "engineer"], "", 10);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Job board</h1>
          <p className="text-inkSoft mt-1">Search live postings with semantic matching</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={scraping}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-inkSoft hover:text-ink hover:border-accent/50 transition-colors disabled:opacity-50 bg-surface"
        >
          {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh listings
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-inkSoft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by role, skill, or company..."
            className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-3 text-sm focus:border-accent outline-none placeholder:text-inkSoft"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-surface border border-border rounded-full px-4 py-3 text-sm text-ink focus:border-accent outline-none"
        >
          <option value="">All sources</option>
          <option value="arbeitnow">Arbeitnow</option>
          <option value="remoteok">RemoteOK</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-3 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-inkSoft text-sm py-12 justify-center">
          <Loader2 size={14} className="animate-spin" /> Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-inkSoft text-sm bg-surface border border-border rounded-2xl shadow-card">
          No jobs indexed yet. Click <span className="text-accent font-medium">Refresh listings</span> to pull in fresh postings.
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
