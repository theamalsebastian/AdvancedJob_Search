import Link from "next/link";
import { ArrowRight, Briefcase, FileText, BarChart3, Sparkles } from "lucide-react";
import { Mark, MatchDial } from "@/components/job/Primitives";
import { ThemeToggle } from "@/components/job/ThemeToggle";
import { jobs } from "@/components/job/data";

const features = [
  {
    icon: Briefcase,
    title: "Live matched roles",
    body: "Postings from the last 14 days, scored line by line against what you've actually shipped.",
  },
  {
    icon: FileText,
    title: "ATS clarity",
    body: "See exactly which keywords parsers miss and rewrite the lines that cost you callbacks.",
  },
  {
    icon: BarChart3,
    title: "Market insight",
    body: "Salary bands, demand curves and the skills quietly becoming table stakes in your field.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-5 sm:px-8">
        <Mark className="h-8 w-8" />
        <span className="font-display text-sm font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
          Job Search AI
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/chat"
            className="rounded-xl px-4 py-2 text-sm font-medium transition-transform hover:scale-[1.03]"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Open app
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="settle">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase"
                style={{ borderColor: "var(--border)", color: "var(--clay-soft)" }}>
                <Sparkles className="h-3.5 w-3.5" /> Live postings · matched to your resume
              </p>
              <h1 className="font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight sm:text-6xl"
                style={{ color: "var(--foreground)" }}>
                The job search,<br />
                <span style={{ color: "var(--clay)" }} className="italic">quietly solved.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ color: "var(--muted-foreground)" }}>
                Ask in plain language. Get live roles scored against your resume, the gaps that keep
                costing you interviews, and a market read that's actually current.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/chat"
                  className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  Start searching
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/jobs"
                  className="tile tile-hover inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  Browse jobs
                </Link>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6"
                style={{ borderColor: "var(--border)" }}>
                {[
                  ["Live", "job postings"],
                  ["14 days", "freshness window"],
                  ["5-dim", "ATS scoring"],
                ].map(([v, k]) => (
                  <div key={k}>
                    <dt className="font-display text-xl font-semibold tabular-nums"
                      style={{ color: "var(--foreground)" }}>{v}</dt>
                    <dd className="mt-1 text-xs tracking-wide uppercase"
                      style={{ color: "var(--muted-foreground)" }}>{k}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hero visual */}
            <div className="settle" style={{ animationDelay: "120ms" }}>
              <div className="tile rounded-3xl border p-4 sm:p-6" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 pb-4">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--primary)" }} />
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Matched to your resume</span>
                </div>
                <div className="space-y-2">
                  {jobs.slice(0, 4).map((j, i) => (
                    <div key={j.id}
                      className="tile tile-hover settle flex items-center gap-4 rounded-2xl border px-4 py-3"
                      style={{ borderColor: "var(--border)", animationDelay: `${200 + i * 80}ms` }}>
                      <MatchDial value={j.match} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>{j.title}</p>
                        <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {j.company} · {j.location}
                        </p>
                      </div>
                      <span className="hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline"
                        style={{ background: "var(--secondary)", color: "var(--clay-soft)" }}>
                        {j.salary}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-16 sm:grid-cols-3 sm:px-8">
            {features.map((f) => (
              <div key={f.title} className="tile tile-hover rounded-2xl border p-6" style={{ borderColor: "var(--border)" }}>
                <span className="grid h-10 w-10 place-items-center rounded-xl ring-1"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                  <f.icon className="h-5 w-5" />
                </span>
                <h2 className="font-display mt-5 text-base font-semibold" style={{ color: "var(--foreground)" }}>
                  {f.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center sm:px-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: "var(--foreground)" }}>
              Stop guessing what's missing.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base"
              style={{ color: "var(--muted-foreground)" }}>
              One question is enough to get a ranked shortlist and the exact gap to close first.
            </p>
            <Link href="/chat"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Open the command center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-8 text-xs sm:px-8"
          style={{ color: "var(--muted-foreground)" }}>
          <span>© {new Date().getFullYear()} Job Search AI</span>
          <span className="font-display tracking-[0.3em] uppercase">RAG · Qdrant · Groq</span>
        </div>
      </footer>
    </div>
  );
}
