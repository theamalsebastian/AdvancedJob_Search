"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Briefcase, FileText, BarChart3 } from "lucide-react";

const links = [
  { href: "/", label: "Query", icon: Terminal },
  { href: "/jobs", label: "Pipeline", icon: Briefcase },
  { href: "/resume", label: "Resume / ATS", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-2 font-mono text-sm text-accent">
          <span className="text-textDim">$</span>
          <span>job-search-ai</span>
          <span className="w-2 h-4 bg-accent animate-pulse inline-block" aria-hidden />
        </div>

        <div className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  active
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-textDim hover:text-text hover:bg-surfaceHover border border-transparent"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}