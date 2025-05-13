"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";

interface FeatureComparison {
  feature: string;
  description?: string;
  options: {
    [key: string]: boolean | string | null | undefined;
  };
}

interface WikiComparisonTableProps {
  options: string[];
  features: FeatureComparison[];
  className?: string;
  caption?: string;
  highlightColumn?: number;
}

export function WikiComparisonTable({
  options,
  features,
  className,
  caption,
  highlightColumn,
}: WikiComparisonTableProps) {
  return (
    <div className={cn("overflow-x-auto relative", className)}>
      <table className="w-full border-collapse">
        {caption && (
          <caption className="text-sm text-left mb-2 text-muted-foreground">
            {caption}
          </caption>
        )}
        
        <thead>
          <tr>
            <th className="text-left py-3 px-4 font-medium text-sm bg-muted/50">
              Feature
            </th>
            {options.map((option, index) => (
              <th 
                key={option} 
                className={cn(
                  "text-center py-3 px-4 font-medium text-sm",
                  highlightColumn === index 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted/50"
                )}
              >
                {option}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {features.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <tr className={cn(
                rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20",
                "border-t border-muted-foreground/10"
              )}>
                <td className="py-3 px-4 text-sm align-top">
                  <div className="font-medium">{row.feature}</div>
                  {row.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {row.description}
                    </div>
                  )}
                </td>
                
                {options.map((option, colIndex) => {
                  const value = row.options[option];
                  return (
                    <td 
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "py-3 px-4 text-center align-middle",
                        highlightColumn === colIndex && "bg-primary/5"
                      )}
                    >
                      {value === true ? (
                        <div className="flex justify-center">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : value === false ? (
                        <div className="flex justify-center">
                          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      ) : value === null || value === undefined ? (
                        <div className="flex justify-center">
                          <Minus className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="text-sm">{value}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}