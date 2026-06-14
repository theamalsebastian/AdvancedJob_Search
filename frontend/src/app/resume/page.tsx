"use client";

import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ATSScoreCard from "@/components/ATSScoreCard";
import { Resume } from "@/lib/api";

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Resume &amp; ATS check</h1>
        <p className="text-inkSoft mt-1">
          Upload your resume to extract skills and see how it scores against an applicant tracking system.
        </p>
      </div>

      <ResumeUpload onUploaded={setResume} />

      {resume && <ATSScoreCard resumeId={resume.id} />}
    </div>
  );
}
