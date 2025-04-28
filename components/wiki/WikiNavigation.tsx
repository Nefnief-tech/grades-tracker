"use client";

import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface WikiNavigationItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface WikiNavigationProps {
  items: WikiNavigationItem[];
  className?: string;
  responsive?: boolean;
}

export function WikiNavigation({
  items,
  className,
  responsive = true,
}: WikiNavigationProps) {
  // Calculate the grid columns based on number of items
  const getGridCols = () => {
    if (!responsive) return "";
    
    // Create responsive grid columns
    const itemCount = items.length;
    if (itemCount <= 2) return "grid-cols-2";
    if (itemCount <= 3) return "grid-cols-2 sm:grid-cols-3";
    if (itemCount <= 4) return "grid-cols-2 sm:grid-cols-4";
    if (itemCount <= 5) return "grid-cols-3 sm:grid-cols-5";
    if (itemCount <= 6) return "grid-cols-3 sm:grid-cols-6";
    return "grid-cols-4 sm:grid-cols-3 lg:grid-cols-7";
  };

  return (
    <TabsList
      className={cn(
        "grid w-full max-w-4xl mb-6 md:mb-8 overflow-x-auto bg-muted/50 p-1 rounded-xl",
        getGridCols(),
        className
      )}
    >
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className="text-xs sm:text-sm whitespace-nowrap rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium"
        >
          {item.icon && (
            <span className="h-3.5 w-3.5 mr-1.5 hidden sm:inline">
              {item.icon}
            </span>
          )}
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}