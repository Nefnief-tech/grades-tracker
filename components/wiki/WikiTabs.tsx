"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WikiTabProps {
  id: string;
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

interface WikiTabsProps {
  tabs: WikiTabProps[];
  defaultTab?: string;
  className?: string;
  variant?: "pills" | "underlined" | "cards";
}

export function WikiTabs({
  tabs,
  defaultTab,
  className,
  variant = "pills",
}: WikiTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const getTabStyles = () => {
    switch (variant) {
      case "underlined":
        return "flex space-x-4 sm:space-x-8 border-b";
      case "cards":
        return "grid grid-cols-2 sm:flex sm:flex-wrap gap-2";
      case "pills":
      default:
        return "flex flex-wrap gap-2 sm:gap-2";
    }
  };

  const getTabButtonStyles = (isActive: boolean) => {
    switch (variant) {
      case "underlined":
        return cn(
          "py-2 px-1 text-sm font-medium border-b-2 -mb-px transition-colors relative",
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
        );
      case "cards":
        return cn(
          "py-2 px-3 text-sm font-medium border rounded-lg flex items-center gap-1.5 transition-colors",
          isActive
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-background border-border text-muted-foreground hover:bg-muted/20"
        );
      case "pills":
      default:
        return cn(
          "py-1.5 px-3 text-xs sm:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        );
    }
  };

  const getContentStyles = () => {
    switch (variant) {
      case "underlined":
        return "mt-6";
      case "cards":
        return "mt-6";
      case "pills":
      default:
        return "mt-6";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className={getTabStyles()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getTabButtonStyles(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            
            {variant === "underlined" && activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary -mb-px"
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>

      <div className={getContentStyles()}>
        <AnimatePresence mode="wait">
          {tabs.map((tab) => {
            if (tab.id !== activeTab) return null;
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                {tab.children}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}