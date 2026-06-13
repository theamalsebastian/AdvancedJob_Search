"use client";

import { useState, useEffect } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ATSScoreCard from "@/components/ATSScoreCard";
import { Resume } from "@/lib/api";

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("resume_id");
    // Resume object not cached — user must re-upload if they refresh.
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-mono text-xl text-text">Resume & ATS Scoring</h1>
        <p className="text-textDim text-sm mt-1">
          Upload your resume to extract skills and run an ATS compatibility check.
        </p>
      </div>

      <ResumeUpload onUploaded={setResume} />

      {resume && <ATSScoreCard resumeId={resume.id} />}
    </div>
  );
}