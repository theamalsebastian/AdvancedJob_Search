"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { uploadResume, Resume } from "@/lib/api";

export default function ResumeUpload({ onUploaded }: { onUploaded: (r: Resume) => void }) {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files supported");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await uploadResume(file);
      setResume(result);
      localStorage.setItem("resume_id", String(result.id));
      onUploaded(result);
    } catch (err) {
      setError("Upload failed — check backend is running");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border bg-surface rounded p-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/40 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {loading ? (
          <Loader2 className="animate-spin mx-auto text-accent" size={32} />
        ) : resume ? (
          <CheckCircle2 className="mx-auto text-accent" size={32} />
        ) : (
          <Upload className="mx-auto text-textDim" size={32} />
        )}

        <p className="mt-3 text-sm text-text">
          {loading ? "Parsing resume..." : resume ? resume.filename : "Drop your resume PDF here, or click to browse"}
        </p>
        {error && <p className="text-warn text-sm mt-2">{error}</p>}
      </div>

      {resume && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
          <div className="bg-bg rounded p-3 border border-border">
            <p className="text-textDim text-xs">Skills detected</p>
            <p className="text-accent text-lg">{resume.skill_count}</p>
          </div>
          <div className="bg-bg rounded p-3 border border-border">
            <p className="text-textDim text-xs">Experience</p>
            <p className="text-accent text-lg">~{resume.experience_years ?? "?"} yrs</p>
          </div>
          <div className="bg-bg rounded p-3 border border-border col-span-2">
            <p className="text-textDim text-xs">Categories</p>
            <p className="text-text text-sm truncate">{Object.keys(resume.skills_by_category).join(", ")}</p>
          </div>
        </div>
      )}

      {resume && (
        <div className="mt-4 space-y-2">
          {Object.entries(resume.skills_by_category).map(([cat, skills]) => (
            <div key={cat} className="text-sm">
              <span className="text-textDim font-mono text-xs uppercase">{cat}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs border border-accent/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}