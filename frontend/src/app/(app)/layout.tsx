import { ContextDock, MobileNav } from "@/components/job/ContextDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden sm:flex">
        <ContextDock />
      </div>
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
