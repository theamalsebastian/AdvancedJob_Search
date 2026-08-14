"use client";

interface MatchDialProps { value: number; size?: number; }

export function MatchDial({ value, size = 48 }: MatchDialProps) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 70 ? "#22c55e" : value >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={4}
          stroke="currentColor" className="text-muted-foreground opacity-20" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={4}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="absolute font-mono text-[10px] font-semibold" style={{ color, fontSize: size * 0.22 }}>
        {value}
      </span>
    </div>
  );
}

interface ScoreRingProps { value: number; size?: number; }

export function ScoreRing({ value, size = 80 }: ScoreRingProps) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={6}
          stroke="currentColor" className="text-muted-foreground opacity-20" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={6}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="absolute font-display text-xl font-semibold" style={{ color }}>
        {Math.round(value)}
      </span>
    </div>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <div className={`grid place-items-center rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm ${className}`}>
      J
    </div>
  );
}
