"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { uploadResume, scoreATS, Resume, ATSResult } from "@/lib/api";
import { ScoreRing } from "./Primitives";

function SkillPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-clay">
      {label}
    </span>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{score.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ResumeSurface() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [ats, setAts] = useState<ATSResult | null>(null);
  const [jd, setJd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files supported"); return; }
    setError(""); setUploading(true);
    try {
      const result = await uploadResume(file);
      setResume(result);
      localStorage.setItem("resume_id", String(result.id));
    } catch { setError("Upload failed — check backend is running"); }
    finally { setUploading(false); }
  }

  async function handleScore() {
    if (!resume) return;
    setScoring(true);
    try {
      const result = await scoreATS(resume.id, jd);
      setAts(result);
    } finally { setScoring(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Resume & ATS check</h1>
        <p className="mt-1 text-muted-foreground">Upload your resume to extract skills and score ATS compatibility.</p>
      </div>

      {/* Upload */}
      <div className="tile settle mb-6 rounded-2xl border border-border p-6">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => e.preventDefault()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-8 py-10 transition-colors hover:border-clay hover:bg-primary/5">
          <input ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {uploading ? <Loader2 className="h-8 w-8 animate-spin text-clay" />
            : resume ? <CheckCircle2 className="h-8 w-8 text-green-500" />
            : <Upload className="h-8 w-8 text-muted-foreground" />}
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Parsing resume…" : resume ? resume.filename : "Drop your PDF here, or click to browse"}
          </p>
          {!resume && !uploading && <p className="text-xs text-muted-foreground">PDF only</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {resume && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Skills found", value: resume.skill_count },
              { label: "Experience", value: `~${resume.experience_years ?? "?"}y` },
              { label: "Categories", value: Object.keys(resume.skills_by_category).length },
              { label: "Status", value: "Parsed ✓" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display text-2xl font-semibold text-clay">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {resume && (
          <div className="mt-5 space-y-3">
            {Object.entries(resume.skills_by_category).map(([cat, skills]) => (
              <div key={cat}>
                <p className="mb-1.5 text-xs font-mono uppercase tracking-wide text-muted-foreground">
                  {cat.replace(/_/g, " ")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => <SkillPill key={s} label={s} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATS score */}
      {resume && (
        <div className="tile settle rounded-2xl border border-border p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">ATS Score</h2>
          <label className="mb-2 block text-sm text-muted-foreground">
            Paste a job description <span className="text-muted-foreground/60">(optional — improves keyword match)</span>
          </label>
          <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={4}
            placeholder="Paste job description here…"
            className="w-full resize-none rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-clay/30 mb-4" />
          <button onClick={handleScore} disabled={scoring}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40">
            {scoring && <Loader2 className="h-4 w-4 animate-spin" />} Run ATS score
          </button>

          {ats && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center gap-1 py-4">
                <ScoreRing value={ats.overall_score} size={96} />
                <p className="text-sm text-muted-foreground mt-2">Overall ATS score</p>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Formatting" score={ats.formatting.score} />
                <ScoreBar label="Sections" score={ats.sections.score} />
                <ScoreBar label="Action verbs" score={ats.action_verbs.score} />
                <ScoreBar label="Quantified results" score={ats.quantification.score} />
                {ats.keyword_match && <ScoreBar label="Keyword match" score={ats.keyword_match.score} />}
              </div>
              {ats.suggestions.length > 0 && (
                <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/30 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    <AlertCircle className="h-4 w-4" /> Suggestions
                  </p>
                  <ul className="space-y-1.5">
                    {ats.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300 flex gap-2">
                        <span>•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ats.keyword_match?.missing_keywords?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats.keyword_match.missing_keywords.map((k) => (
                      <span key={k} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
