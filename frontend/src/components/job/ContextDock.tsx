"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Briefcase, FileCheck, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", icon: MessageSquare, label: "Chat" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/resume", icon: FileCheck, label: "Resume & ATS" },
  { href: "/analytics", icon: BarChart3, label: "Insights" },
];

export function ContextDock() {
  const pathname = usePathname();

  return (
    <aside className="tile flex h-screen w-60 shrink-0 flex-col border-r border-border px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold font-display">
          J
        </span>
        <span className="font-display text-base font-semibold text-foreground">Job Search AI</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground">v2.0</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-background/90 backdrop-blur-xl sm:hidden">
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
