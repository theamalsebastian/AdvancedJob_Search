"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { scoreATS, ATSResult } from "@/lib/api";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "bg-success" : score >= 40 ? "bg-warn" : "bg-accent";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-inkSoft">{label}</span>
        <span className="font-data text-ink">{score.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-surfaceAlt rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
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
    <div className="border border-border bg-surface rounded-2xl p-6 space-y-5">
      <div>
        <label className="text-sm font-medium text-ink block mb-2">
          Paste a job description <span className="text-inkSoft font-normal">(optional — improves keyword match scoring)</span>
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
          placeholder="Paste the job description here..."
          className="w-full bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none placeholder:text-inkSoft resize-none"
        />
      </div>

      <button
        onClick={handleScore}
        disabled={loading}
        className="px-5 py-2.5 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-40 flex items-center gap-2"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Run ATS score
      </button>

      {result && (
        <div className="space-y-5 pt-2">
          <div className="text-center bg-surfaceAlt rounded-2xl py-6">
            <p className="font-display text-5xl font-semibold text-accent">{result.overall_score.toFixed(0)}</p>
            <p className="text-inkSoft text-sm mt-1">Overall ATS score</p>
          </div>

          <div className="space-y-4">
            <ScoreBar label="Formatting" score={result.formatting.score} />
            <ScoreBar label="Sections" score={result.sections.score} />
            <ScoreBar label="Action verbs" score={result.action_verbs.score} />
            <ScoreBar label="Quantified results" score={result.quantification.score} />
            {result.keyword_match && (
              <ScoreBar label="Keyword match" score={result.keyword_match.score} />
            )}
          </div>

          {result.suggestions.length > 0 && (
            <div className="border-t border-border pt-5">
              <p className="text-sm text-ink font-medium mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-warn" /> Suggestions
              </p>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-inkSoft flex items-start gap-2 leading-relaxed">
                    <span className="text-warn mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.keyword_match && result.keyword_match.missing_keywords.length > 0 && (
            <div className="border-t border-border pt-5">
              <p className="text-sm text-ink font-medium mb-3">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keyword_match.missing_keywords.map((k) => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-warnSoft text-warn text-xs font-medium">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.overall_score >= 70 && (
            <div className="flex items-center gap-2 text-success text-sm border-t border-border pt-5">
              <CheckCircle2 size={16} /> Strong ATS compatibility
            </div>
          )}
        </div>
      )}
    </div>
  );
}
