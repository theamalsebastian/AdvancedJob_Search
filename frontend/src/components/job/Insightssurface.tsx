"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { getAnalytics, Analytics } from "@/lib/api";
import { EmptyState, ErrorState } from "./States";

const COLORS = ["#1a1a1a", "#444", "#666", "#888", "#aaa"];

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="tile settle rounded-2xl border border-border p-5">
      <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};

export function InsightsSurface() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-32 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading insights…
    </div>
  );

  if (error) return <ErrorState message="Couldn't load analytics. Is the backend running?" />;
  if (!data) return <EmptyState title="No data yet" description="Run some searches to see insights." />;

  const sourceData = Object.entries(data.jobs_by_source).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Insights</h1>
        <p className="mt-1 text-muted-foreground">Pipeline stats, in-demand skills, and search activity</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total jobs" value={data.total_jobs} />
        <StatTile label="Resumes parsed" value={data.total_resumes} />
        <StatTile label="Searches run" value={data.total_searches} />
        <StatTile label="Avg response" value={`${data.avg_response_time_ms}ms`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="tile settle rounded-2xl border border-border p-5">
          <p className="font-display text-lg font-semibold text-foreground mb-5">Top skills in demand</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_skills_in_demand} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis dataKey="skill" type="category" stroke="var(--muted-foreground)" fontSize={11} width={100} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" fill="var(--foreground)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="tile settle rounded-2xl border border-border p-5">
          <p className="font-display text-lg font-semibold text-foreground mb-5">Jobs by source</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} label={(e) => `${e.name}: ${e.value}`}>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.searches_over_time.length > 0 && (
        <div className="tile settle rounded-2xl border border-border p-5">
          <p className="font-display text-lg font-semibold text-foreground mb-5">Searches over time (7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.searches_over_time}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="count" stroke="var(--foreground)" strokeWidth={2} dot={{ fill: "var(--foreground)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
