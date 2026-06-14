import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Insights</h1>
        <p className="text-inkSoft mt-1">Pipeline stats, in-demand skills, and search activity</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
