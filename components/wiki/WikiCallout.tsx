"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lightbulb, AlertCircle, Info, BookMarked } from "lucide-react";

type CalloutType = "tip" | "note" | "warning" | "important";

interface WikiCalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  title?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function WikiCallout({
  children,
  type = "note",
  title,
  className,
  icon,
}: WikiCalloutProps) {
  const defaultIcons = {
    tip: <Lightbulb className="h-5 w-5" />,
    note: <Info className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    important: <BookMarked className="h-5 w-5" />,
  };

  const styles = {
    tip: "bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-400 dark:from-green-950/20 dark:to-teal-950/20 dark:border-green-800",
    note: "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800",
    warning: "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800",
    important: "bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 dark:from-purple-950/20 dark:to-violet-950/20 dark:border-purple-800",
  };

  const headerColors = {
    tip: "text-green-700 dark:text-green-400",
    note: "text-blue-700 dark:text-blue-400",
    warning: "text-amber-700 dark:text-amber-400",
    important: "text-purple-700 dark:text-purple-400",
  };

  const defaultTitles = {
    tip: "Tip",
    note: "Note",
    warning: "Warning",
    important: "Important",
  };

  return (
    <motion.div
      className={cn("p-4 rounded-lg shadow-sm", styles[type], className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", headerColors[type])}>
          {icon || defaultIcons[type]}
        </div>
        
        <div>
          <h4 className={cn("font-medium text-base mb-1", headerColors[type])}>
            {title || defaultTitles[type]}
          </h4>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}