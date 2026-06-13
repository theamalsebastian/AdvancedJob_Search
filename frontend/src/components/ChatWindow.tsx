"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Zap } from "lucide-react";
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
        { role: "assistant", content: "Error: could not reach the backend. Check API_URL and that the server is running." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="font-mono text-sm text-textDim">
              <span className="text-accent">$</span> ask anything about jobs, skills, or your resume match
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSend(ex)}
                  className="text-left text-sm border border-border rounded p-3 hover:border-accent/40 hover:bg-surfaceHover transition-colors text-textDim hover:text-text"
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
                <div className="flex gap-2 items-start">
                  <span className="font-mono text-accent text-sm mt-0.5">{">"}</span>
                  <p className="text-text">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-surface border border-border rounded p-4">
                    <p className="text-text whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.timing && (
                      <p className="font-mono text-xs text-textDim mt-3 pt-3 border-t border-border flex items-center gap-1">
                        <Zap size={12} className="text-accent" />
                        retrieval {msg.timing.retrieval_ms}ms · llm {msg.timing.llm_ms}ms
                      </p>
                    )}
                  </div>
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <div className="flex items-center gap-2 text-textDim text-sm font-mono">
              <Loader2 size={14} className="animate-spin" />
              searching jobs, reranking, generating answer...
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
            className="flex-1 bg-bg border border-border rounded px-4 py-2.5 text-sm focus:border-accent outline-none placeholder:text-textDim"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded bg-accent text-bg font-medium text-sm disabled:opacity-40 hover:bg-accentDim transition-colors flex items-center gap-1.5"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}