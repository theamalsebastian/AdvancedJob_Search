"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Briefcase, FileCheck, BarChart3 } from "lucide-react";

const links = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/resume", label: "Resume & ATS", icon: FileCheck },
  { href: "/analytics", label: "Insights", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b-2 border-border bg-surface/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-display font-semibold text-sm">
            J
          </span>
          <span className="font-display text-lg font-semibold text-ink hidden sm:inline">
            Job Search AI
          </span>
        </Link>

        <div className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-accentSoft text-accent"
                    : "text-inkSoft hover:text-ink hover:bg-surfaceAlt"
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
