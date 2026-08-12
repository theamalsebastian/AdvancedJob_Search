import { Inbox, AlertCircle } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground opacity-40" />
      <p className="font-semibold text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
