"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Briefcase, CornerDownLeft, Loader2 } from "lucide-react";
import { chatQuery, Job } from "@/lib/api";
import { MatchDial } from "./Primitives";

const suggestions = [
  "What jobs match my Python and ML skills?",
  "Find remote backend engineer roles",
  "What skills should I learn for MLOps?",
  "Summarize current AI job market trends",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  jobs?: Job[];
  retrieval_ms?: number;
  llm_ms?: number;
}

function JobLine({ job }: { job: Job }) {
  return (
    <a
      href={job.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="tile tile-hover flex items-center gap-4 rounded-xl border border-border px-4 py-3"
    >
      <MatchDial value={72} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{job.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {job.company} · {job.location}
        </p>
      </div>
      <span className="hidden shrink-0 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-clay-soft sm:inline">
        {job.source}
      </span>
    </a>
  );
}

function renderRich(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
    const content = isBullet ? trimmed.slice(2) : line;
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      ) : <span key={j}>{part}</span>
    );
    if (isBullet) return <li key={i} className="ml-4 list-disc text-foreground/90 leading-relaxed">{parts}</li>;
    if (!trimmed) return <div key={i} className="h-2" />;
    return <p key={i} className="text-foreground/90 leading-relaxed">{parts}</p>;
  });
}

export function ChatSurface({ resumeId }: { resumeId?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(query?: string) {
    const text = (query ?? input).trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatQuery(text, resumeId);
      setMessages((m) => [...m, {
        role: "assistant",
        content: res.answer,
        jobs: res.jobs,
        retrieval_ms: res.retrieval_ms,
        llm_ms: res.llm_ms,
      }]);
    } catch {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "Couldn't reach the job index right now. Try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 sm:px-10">
        <div className="mx-auto w-full max-w-3xl space-y-10">
          {messages.length === 0 && (
            <>
              <header className="settle max-w-2xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium tracking-wide text-clay-soft uppercase">
                  <Briefcase className="h-3.5 w-3.5" /> Live postings · matched to your resume
                </p>
                <h1 className="font-display text-4xl leading-[1.05] font-semibold text-foreground sm:text-5xl">
                  What are you <span className="text-clay italic">looking for?</span>
                </h1>
                <p className="mt-4 text-base text-muted-foreground">
                  Ask in plain language. I search live job postings and tell you exactly what matches — and what's missing.
                </p>
              </header>
              <div className="settle flex flex-wrap gap-2" style={{ animationDelay: "80ms" }}>
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => handleSend(s)}
                    className="tile tile-hover group rounded-full border border-primary/25 px-4 py-2 text-sm text-foreground/90">
                    {s}
                    <CornerDownLeft className="ml-2 inline h-3.5 w-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <p className="max-w-md rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">{msg.content}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">{renderRich(msg.content)}</div>
                    {msg.jobs && msg.jobs.length > 0 && (
                      <div className="space-y-2">
                        {msg.jobs.map((job, j) => <JobLine key={j} job={job} />)}
                      </div>
                    )}
                    {msg.retrieval_ms && (
                      <p className="text-xs text-muted-foreground">retrieved in {msg.retrieval_ms}ms · answered in {msg.llm_ms}ms</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching jobs and writing your answer…
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-background/70 px-6 py-5 backdrop-blur-xl sm:px-10">
        <div className="tile mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border p-2 pl-4">
          <button type="button" className="mb-1.5 text-muted-foreground transition-colors hover:text-clay" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about jobs, skills, or career strategy…"
            className="max-h-32 flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          <button type="button" aria-label="Send" disabled={loading || !input.trim()} onClick={() => handleSend()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
