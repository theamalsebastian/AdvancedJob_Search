"use client";

import { useEffect, useState } from "react";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  const [resumeId, setResumeId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("resume_id");
    if (stored) setResumeId(Number(stored));
  }, []);

  return <ChatWindow resumeId={resumeId} />;
}