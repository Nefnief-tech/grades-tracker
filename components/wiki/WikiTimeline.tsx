"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";

interface TimelineItem {
  title: string;
  description: string;
  date?: string;
  icon?: React.ReactNode;
  status?: "completed" | "current" | "upcoming";
}

interface WikiTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function WikiTimeline({ items, className }: WikiTimelineProps) {
  return (
    <div className={cn("relative space-y-6 pl-6 md:pl-8", className)}>
      {/* Vertical line */}
      <div className="absolute top-2 bottom-2 left-2 md:left-3 w-0.5 bg-border" />
      
      {items.map((item, index) => {
        const delay = 0.15 * index;
        const getStatusColor = () => {
          switch (item.status) {
            case "completed":
              return "bg-green-100 border-green-300 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400";
            case "current":
              return "bg-primary/10 border-primary/30 text-primary";
            case "upcoming":
            default:
              return "bg-muted border-muted-foreground/20 text-muted-foreground"; 
          }
        };

        const getStatusIcon = () => {
          if (item.icon) return item.icon;
          switch (item.status) {
            case "completed": 
              return <Check className="h-3.5 w-3.5" />;
            case "current":
            case "upcoming":
            default:
              return <Clock className="h-3.5 w-3.5" />;
          }
        };

        return (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
          >
            {/* Circle indicator */}
            <div 
              className={cn(
                "absolute left-[-24px] md:left-[-32px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center",
                getStatusColor()
              )}
            >
              {getStatusIcon()}
            </div>

            <div className="pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base font-medium">{item.title}</h3>
                {item.date && (
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                )}
              </div>
              <p className="text-sm mt-1">{item.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}