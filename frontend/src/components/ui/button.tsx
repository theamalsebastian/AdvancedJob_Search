import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-transform hover:scale-105 disabled:opacity-40",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-muted",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}
