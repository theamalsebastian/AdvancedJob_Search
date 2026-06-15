import { MapPin, ExternalLink, Calendar } from "lucide-react";
import { Job } from "@/lib/api";

export default function JobCard({ job, score }: { job: Job; score?: number }) {
  return (
    <div className="border border-border bg-surface rounded-2xl shadow-card p-5 hover:border-accent/50 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-ink leading-snug text-lg">{job.title}</h3>
          <p className="text-sm text-inkSoft mt-0.5">{job.company}</p>
        </div>
        {score !== undefined && (
          <span className="font-data text-xs px-2.5 py-1 rounded-full bg-successSoft text-success whitespace-nowrap">
            {(score * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-inkSoft">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {job.posted_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {job.posted_date.slice(0, 10)}
          </span>
        )}
        <span className="uppercase tracking-wide font-data text-[10px] px-2 py-0.5 rounded-full bg-surfaceAlt text-inkSoft">
          {job.source}
        </span>
      </div>

      {job.description && (
        <p className="text-sm text-inkSoft mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
      )}

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-accent hover:underline"
        >
          View posting <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
