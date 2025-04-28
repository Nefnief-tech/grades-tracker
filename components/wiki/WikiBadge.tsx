"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "secondary" | "outline" | "accent";

interface WikiBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function WikiBadge({
  children,
  variant = "primary",
  className,
}: WikiBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary/10 text-secondary-foreground";
      case "outline":
        return "bg-background border border-border text-foreground";
      case "accent":
        return "bg-accent/10 text-accent-foreground";
      case "primary":
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStyles(),
        className
      )}
    >
      {children}
    </span>
  );
}