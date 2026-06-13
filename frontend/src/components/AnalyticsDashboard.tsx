"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { getAnalytics, Analytics } from "@/lib/api";

const COLORS = ["#3FB950", "#58A6FF", "#F78166", "#8B949E", "#2EA043"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-surface rounded p-4">
      <p className="text-textDim text-xs font-mono uppercase">{label}</p>
      <p className="text-2xl font-mono text-accent mt-1">{value}</p>
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
      <div className="flex items-center gap-2 text-textDim text-sm font-mono py-12 justify-center">
        <Loader2 size={14} className="animate-spin" /> loading analytics...
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-textDim text-sm">Could not load analytics. Is the backend running?</div>;
  }

  const sourceData = Object.entries(data.jobs_by_source).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Jobs" value={data.total_jobs} />
        <StatCard label="Resumes Parsed" value={data.total_resumes} />
        <StatCard label="Searches Run" value={data.total_searches} />
        <StatCard label="Avg Response" value={`${data.avg_response_time_ms}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border bg-surface rounded p-4">
          <p className="text-sm text-text font-medium mb-4">Top Skills In Demand</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.top_skills_in_demand} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#8B949E" fontSize={11} />
              <YAxis dataKey="skill" type="category" stroke="#8B949E" fontSize={11} width={100} />
              <Tooltip
                contentStyle={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: "#E6EDF3" }}
              />
              <Bar dataKey="count" fill="#3FB950" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border bg-surface rounded p-4">
          <p className="text-sm text-text font-medium mb-4">Jobs by Source</p>
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
              <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 4, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.searches_over_time.length > 0 && (
        <div className="border border-border bg-surface rounded p-4">
          <p className="text-sm text-text font-medium mb-4">Searches Over Time (7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.searches_over_time}>
              <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8B949E" fontSize={11} />
              <YAxis stroke="#8B949E" fontSize={11} />
              <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 4, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#3FB950" strokeWidth={2} dot={{ fill: "#3FB950" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}