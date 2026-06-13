import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-mono text-xl text-text">Analytics</h1>
        <p className="text-textDim text-sm mt-1">Pipeline stats, in-demand skills, search activity</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}