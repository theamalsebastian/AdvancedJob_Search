"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";
import { uploadResume, Resume } from "@/lib/api";

export default function ResumeUpload({ onUploaded }: { onUploaded: (r: Resume) => void }) {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported");
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
      setError("Upload failed — check that the backend is running");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border bg-surface rounded-2xl p-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-surfaceAlt/50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {loading ? (
          <Loader2 className="animate-spin mx-auto text-accent" size={28} />
        ) : resume ? (
          <CheckCircle2 className="mx-auto text-success" size={28} />
        ) : (
          <Upload className="mx-auto text-inkSoft" size={28} />
        )}

        <p className="mt-3 text-sm text-ink font-medium">
          {loading ? "Reading your resume..." : resume ? resume.filename : "Drop your resume here, or click to browse"}
        </p>
        {!resume && !loading && (
          <p className="text-xs text-inkSoft mt-1">PDF only</p>
        )}
        {error && <p className="text-warn text-sm mt-2">{error}</p>}
      </div>

      {resume && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surfaceAlt rounded-xl p-3">
            <p className="text-inkSoft text-xs">Skills found</p>
            <p className="font-display text-2xl text-accent">{resume.skill_count}</p>
          </div>
          <div className="bg-surfaceAlt rounded-xl p-3">
            <p className="text-inkSoft text-xs">Experience</p>
            <p className="font-display text-2xl text-accent">~{resume.experience_years ?? "?"}<span className="text-sm text-inkSoft"> yrs</span></p>
          </div>
          <div className="bg-surfaceAlt rounded-xl p-3 col-span-2">
            <p className="text-inkSoft text-xs">Categories covered</p>
            <p className="text-ink text-sm mt-1 truncate">{Object.keys(resume.skills_by_category).join(", ")}</p>
          </div>
        </div>
      )}

      {resume && (
        <div className="mt-4 space-y-3">
          {Object.entries(resume.skills_by_category).map(([cat, skills]) => (
            <div key={cat}>
              <span className="text-inkSoft font-data text-[11px] uppercase tracking-wide">{cat.replace(/_/g, " ")}</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-accentSoft text-accent text-xs font-medium">
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
