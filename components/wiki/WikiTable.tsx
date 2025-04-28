"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WikiTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  compact?: boolean;
  className?: string;
  caption?: string;
}

export function WikiTable({
  headers,
  rows,
  compact = false,
  className,
  caption,
}: WikiTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className="min-w-full divide-y divide-border">
        {caption && (
          <caption className="text-sm text-muted-foreground p-2 text-left">
            {caption}
          </caption>
        )}
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className={cn(
                  "text-left text-xs font-semibold",
                  compact ? "px-2 py-1.5" : "px-2 py-2 sm:px-4 sm:py-3"
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background text-xs">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/40">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    compact ? "px-2 py-1.5" : "px-2 py-2 sm:px-4 sm:py-3"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}