"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, AlertCircle, Check, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CLOUD_CONNECTIVITY_STATUS } from "@/lib/appwrite";

export function CloudStatusIndicator() {
  const [status, setStatus] = useState<"unknown" | "connected" | "error">(
    typeof CLOUD_CONNECTIVITY_STATUS !== "undefined"
      ? CLOUD_CONNECTIVITY_STATUS
      : "unknown"
  );
  const [isChecking, setIsChecking] = useState(false);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [showEnvDetails, setShowEnvDetails] = useState(false);

  // Check environment variables
  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch("/api/environment-check");
        if (response.ok) {
          const data = await response.json();
          setEnvStatus(data.envStatus);
        }
      } catch (error) {
        console.error("Failed to check environment variables:", error);
      }
    };

    checkEnv();
  }, []);

  // Manual status check
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const { checkCloudConnection } = await import("@/lib/appwrite");
      const result = await checkCloudConnection();
      setStatus(result ? "connected" : "error");

      // Refresh browser if first successful connection after error
      if (result && status === "error") {
        window.location.reload();
      }
    } catch (error) {
      setStatus("error");
      console.error("Error checking cloud status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Icon and color based on status
  const statusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;

    switch (status) {
      case "connected":
        return <Cloud className="h-4 w-4 text-green-500" />;
      case "error":
        return <CloudOff className="h-4 w-4 text-red-500" />;
      default:
        return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  // Status text
  const statusText = () => {
    if (isChecking) return "Checking...";

    switch (status) {
      case "connected":
        return "Connected";
      case "error":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 text-xs"
            onClick={checkStatus}
          >
            {statusIcon()}
            {statusText()}
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end" className="w-64 p-0">
          <div className="p-2">
            <h4 className="font-medium mb-1">Cloud Connection</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {status === "connected"
                ? "Connected to Appwrite cloud."
                : status === "error"
                ? "Error connecting to Appwrite. Data will be stored locally."
                : "Cloud connection status unknown."}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 mb-2"
              onClick={() => setShowEnvDetails(!showEnvDetails)}
            >
              {showEnvDetails ? "Hide Details" : "Show Details"}
            </Button>

            {showEnvDetails && (
              <div className="text-xs border rounded-md p-2 mb-2 bg-muted/30 space-y-1">
                <p className="font-medium">Environment Variables:</p>
                <ul className="space-y-1">
                  {Object.entries(envStatus).map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      {value ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="default"
                size="sm"
                className="h-7 gap-1"
                onClick={checkStatus}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
