"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { scoreATS, ATSResult } from "@/lib/api";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "bg-accent" : score >= 40 ? "bg-info" : "bg-warn";
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-textDim">{label}</span>
        <span className="text-text">{score.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-bg rounded-full overflow-hidden border border-border">
        <div className={`h-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ATSScoreCard({ resumeId }: { resumeId: number }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScore() {
    setLoading(true);
    try {
      const res = await scoreATS(resumeId, jd);
      setResult(res);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border bg-surface rounded p-6 space-y-4">
      <div>
        <label className="text-sm text-textDim block mb-2">
          Paste a job description (optional — improves keyword match scoring)
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
          placeholder="Paste job description here..."
          className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:border-accent outline-none placeholder:text-textDim resize-none"
        />
      </div>

      <button
        onClick={handleScore}
        disabled={loading}
        className="px-4 py-2 rounded bg-accent text-bg font-medium text-sm hover:bg-accentDim transition-colors disabled:opacity-40 flex items-center gap-2"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Run ATS Score
      </button>

      {result && (
        <div className="space-y-4 pt-2">
          <div className="text-center">
            <p className="font-mono text-4xl text-accent">{result.overall_score.toFixed(0)}</p>
            <p className="text-textDim text-sm">Overall ATS Score</p>
          </div>

          <div className="space-y-3">
            <ScoreBar label="Formatting" score={result.formatting.score} />
            <ScoreBar label="Sections" score={result.sections.score} />
            <ScoreBar label="Action Verbs" score={result.action_verbs.score} />
            <ScoreBar label="Quantified Results" score={result.quantification.score} />
            {result.keyword_match && (
              <ScoreBar label="Keyword Match" score={result.keyword_match.score} />
            )}
          </div>

          {result.suggestions.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-text font-medium mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-warn" /> Suggestions
              </p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-textDim flex items-start gap-2">
                    <span className="text-warn mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.keyword_match && result.keyword_match.missing_keywords.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-text font-medium mb-2">Missing Keywords</p>
              <div className="flex flex-wrap gap-1">
                {result.keyword_match.missing_keywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded bg-warn/10 text-warn text-xs border border-warn/20">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.overall_score >= 70 && (
            <div className="flex items-center gap-2 text-accent text-sm border-t border-border pt-4">
              <CheckCircle2 size={16} /> Strong ATS compatibility
            </div>
          )}
        </div>
      )}
    </div>
  );
}