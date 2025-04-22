import * as React from "react";
import { cn } from "@/lib/utils";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

export function Banner({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: BannerProps) {
  return (
    <div
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 border-b text-sm font-medium",
        variant === "destructive"
          ? "bg-destructive/10 border-destructive text-destructive"
          : "bg-primary/10 border-primary text-primary",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
