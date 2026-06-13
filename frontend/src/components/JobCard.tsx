import { MapPin, ExternalLink, Calendar } from "lucide-react";
import { Job } from "@/lib/api";

export default function JobCard({ job, score }: { job: Job; score?: number }) {
  return (
    <div className="border border-border bg-surface rounded p-4 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text leading-tight">{job.title}</h3>
          <p className="text-sm text-textDim mt-0.5">{job.company}</p>
        </div>
        {score !== undefined && (
          <span className="font-mono text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30 whitespace-nowrap">
            {(score * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-textDim font-mono">
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
        <span className="uppercase tracking-wide text-info">{job.source}</span>
      </div>

      {job.description && (
        <p className="text-sm text-textDim mt-3 line-clamp-2">{job.description}</p>
      )}

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm text-accent hover:underline"
        >
          View posting <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}