import type { Metadata } from "next";
import "./globals.css";
import { ContextDock, MobileNav } from "@/components/job/ContextDock";

export const metadata: Metadata = {
  title: "Job Search AI — Career Pipeline",
  description: "RAG-powered job search assistant with semantic search and ATS scoring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
        {/* Sidebar — desktop only */}
        <div className="hidden sm:flex">
          <ContextDock />
        </div>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          {children}
        </main>
        {/* Bottom nav — mobile only */}
        <MobileNav />
      </body>
    </html>
  );
}
