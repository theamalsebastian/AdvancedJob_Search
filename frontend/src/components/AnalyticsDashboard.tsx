"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { getAnalytics, Analytics } from "@/lib/api";

const COLORS = ["#FF6B4A", "#5B8C5A", "#D97706", "#6B7280", "#FFB39A"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-surface rounded-2xl p-5">
      <p className="text-inkSoft text-xs uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl font-semibold text-accent mt-1">{value}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-inkSoft text-sm py-12 justify-center">
        <Loader2 size={14} className="animate-spin" /> Loading insights...
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-16 text-inkSoft text-sm bg-surface border border-border rounded-2xl">Could not load analytics. Is the backend running?</div>;
  }

  const sourceData = Object.entries(data.jobs_by_source).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total jobs" value={data.total_jobs} />
        <StatCard label="Resumes parsed" value={data.total_resumes} />
        <StatCard label="Searches run" value={data.total_searches} />
        <StatCard label="Avg response" value={`${data.avg_response_time_ms}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="font-display text-lg font-semibold text-ink mb-4">Top skills in demand</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.top_skills_in_demand} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#6B7280" fontSize={11} />
              <YAxis dataKey="skill" type="category" stroke="#6B7280" fontSize={11} width={100} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E2D9", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#1F2937" }}
              />
              <Bar dataKey="count" fill="#FF6B4A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="font-display text-lg font-semibold text-ink mb-4">Jobs by source</p>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E2D9", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.searches_over_time.length > 0 && (
        <div className="border border-border bg-surface rounded-2xl p-5">
          <p className="font-display text-lg font-semibold text-ink mb-4">Searches over time (7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.searches_over_time}>
              <CartesianGrid stroke="#E8E2D9" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E2D9", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#FF6B4A" strokeWidth={2} dot={{ fill: "#FF6B4A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
