'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

type ApiStatus = 'connected' | 'error' | 'warning' | 'not-configured';

interface ApiStatusAlertProps {
  status: ApiStatus;
  mode?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ApiStatusAlert({
  status,
  mode,
  title,
  description,
  className,
}: ApiStatusAlertProps) {
  // Determine the icon and styling based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: BadgeCheck,
          iconClass: 'text-green-500',
          defaultTitle: 'API Connected',
          alertClass: 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconClass: 'text-destructive',
          defaultTitle: 'API Error',
          alertClass: 'border-destructive/30 bg-destructive/10 text-destructive'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClass: 'text-amber-500',
          defaultTitle: 'API Warning',
          alertClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
        };
      case 'not-configured':
        return {
          icon: Info,
          iconClass: 'text-blue-500',
          defaultTitle: 'API Not Configured',
          alertClass: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          icon: Info,
          iconClass: 'text-muted-foreground',
          defaultTitle: 'API Status',
          alertClass: ''
        };
    }
  };

  const { icon: Icon, iconClass, defaultTitle, alertClass } = getStatusConfig();
  
  return (
    <Alert variant="default" className={cn("flex items-center", alertClass, className)}>
      <Icon className={cn("h-5 w-5 mr-2", iconClass)} />
      <div>
        <AlertTitle className="text-sm font-medium leading-none">
          {title || defaultTitle}
        </AlertTitle>
        <AlertDescription className="text-xs mt-1">
          {description}
          {mode && (
            <span className="ml-1 font-medium">
              Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}