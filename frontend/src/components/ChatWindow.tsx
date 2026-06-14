"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { chatQuery, Job, ChatResponse } from "@/lib/api";
import JobCard from "./JobCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  jobs?: Job[];
  timing?: { retrieval_ms: number; llm_ms: number };
}

const EXAMPLES = [
  "What jobs match my Python and ML skills?",
  "Find remote backend engineer roles",
  "What skills should I learn for MLOps?",
  "Summarize current AI job market trends",
];

// Minimal markdown: **bold** and bullet lines starting with *
function renderRich(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
    const content = isBullet ? trimmed.slice(2) : line;
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );
    if (isBullet) {
      return (
        <li key={i} className="ml-4 list-disc text-ink leading-relaxed">
          {parts}
        </li>
      );
    }
    if (!trimmed) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-ink leading-relaxed">
        {parts}
      </p>
    );
  });
}

export default function ChatWindow({ resumeId }: { resumeId?: number }) {
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
      const res: ChatResponse = await chatQuery(text, resumeId);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          jobs: res.jobs,
          timing: { retrieval_ms: res.retrieval_ms, llm_ms: res.llm_ms },
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the job index right now. Make sure the backend is running and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">
                What are you looking for?
              </h1>
              <p className="text-inkSoft mt-2">
                Ask in plain language — I'll search live job postings and match them against your resume.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSend(ex)}
                  className="text-left text-sm border border-border rounded-xl p-4 bg-surface hover:border-accent/50 hover:shadow-sm transition-all text-inkSoft hover:text-ink"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-ink text-bg rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                    <p>{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-surface border border-border rounded-2xl rounded-bl-sm p-5">
                    <div className="space-y-1">{renderRich(msg.content)}</div>
                    {msg.timing && (
                      <p className="font-data text-[11px] text-inkSoft mt-4 pt-3 border-t border-border flex items-center gap-1.5">
                        <Sparkles size={12} className="text-accent" />
                        retrieved in {msg.timing.retrieval_ms}ms · answered in {msg.timing.llm_ms}ms
                      </p>
                    )}
                  </div>
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.jobs.map((job, j) => (
                        <JobCard key={j} job={job} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-inkSoft text-sm">
              <Loader2 size={14} className="animate-spin" />
              Searching jobs and writing your answer...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about jobs, skills, or career strategy..."
            className="flex-1 bg-surfaceAlt border border-border rounded-full px-5 py-3 text-sm focus:border-accent outline-none placeholder:text-inkSoft"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-full bg-accent text-white font-medium text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors flex items-center gap-1.5"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
