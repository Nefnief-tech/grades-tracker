"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface WikiCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function WikiCodeBlock({
  code,
  language = "bash",
  showLineNumbers = false,
  className,
}: WikiCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className={cn("relative group", className)}>
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="p-1 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre
        className={cn(
          "bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs whitespace-pre",
          language === "bash" && "text-emerald-700 dark:text-emerald-400",
          language === "typescript" && "text-blue-700 dark:text-blue-400",
          language === "json" && "text-amber-700 dark:text-amber-400"
        )}
      >
        {showLineNumbers ? (
          <div className="flex">
            <div className="select-none text-muted-foreground pr-3 border-r border-border mr-3">
              {lines.map((_, i) => (
                <div key={i} className="text-right">
                  {i + 1}
                </div>
              ))}
            </div>
            <code>{code}</code>
          </div>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}