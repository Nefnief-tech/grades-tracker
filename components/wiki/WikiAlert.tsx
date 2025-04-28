"use client";

import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface WikiAlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function WikiAlert({
  title,
  children,
  variant = "info",
  className,
}: WikiAlertProps) {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return (
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "danger":
        return (
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
        );
      case "info":
      default:
        return (
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        );
    }
  };

  const getStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
      case "danger":
        return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    }
  };

  const getTitleStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-800 dark:text-green-300";
      case "warning":
        return "text-yellow-800 dark:text-yellow-300";
      case "danger":
        return "text-red-800 dark:text-red-300";
      case "info":
      default:
        return "text-blue-800 dark:text-blue-300";
    }
  };

  const getContentStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-700 dark:text-green-200";
      case "warning":
        return "text-yellow-700 dark:text-yellow-200";
      case "danger":
        return "text-red-700 dark:text-red-200";
      case "info":
      default:
        return "text-blue-700 dark:text-blue-200";
    }
  };

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-lg border",
        getStyles(),
        className
      )}
    >
      <div className="flex gap-3 items-start">
        <div className="mt-0.5">{getIcon()}</div>
        <div>
          {title && (
            <h4 className={cn("text-sm sm:text-base font-semibold mb-1", getTitleStyles())}>
              {title}
            </h4>
          )}
          <div className={cn("text-xs sm:text-sm", getContentStyles())}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}