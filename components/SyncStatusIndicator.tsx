"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  saveSubjectsToStorage,
  getSubjectsFromStorage,
} from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";

export function SyncStatusIndicator() {
  const [syncState, setSyncState] = useState<
    "synced" | "failed" | "syncing" | "disabled"
  >("disabled");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update the sync status indicator
  useEffect(() => {
    const updateSyncStatus = () => {
      if (!user?.syncEnabled) {
        setSyncState("disabled");
        return;
      }

      const timestamp = localStorage.getItem("lastSyncTimestamp");
      if (timestamp) {
        setLastSyncTime(timestamp);
        setSyncState("synced");
      }
    };

    updateSyncStatus();

    // Listen for sync events
    window.addEventListener("syncPreferenceChanged", updateSyncStatus);
    window.addEventListener("subjectsUpdated", updateSyncStatus);

    return () => {
      window.removeEventListener("syncPreferenceChanged", updateSyncStatus);
      window.removeEventListener("subjectsUpdated", updateSyncStatus);
    };
  }, [user]);

  // Force a manual sync
  const handleManualSync = async () => {
    if (!user || !user.syncEnabled) {
      toast({
        title: "Sync disabled",
        description: "Enable cloud sync in settings first",
        variant: "destructive",
      });
      return;
    }

    setSyncState("syncing");
    try {
      const subjects = await getSubjectsFromStorage(user.id, false); // Get local subjects
      const syncSuccess = await saveSubjectsToStorage(subjects, user.id, true); // Force cloud sync

      if (syncSuccess) {
        setSyncState("synced");
        setLastSyncTime(new Date().toISOString());
        toast({
          title: "Sync successful",
          description: "Your data has been synchronized with the cloud",
        });
      } else {
        setSyncState("failed");
        toast({
          title: "Sync failed",
          description: "Failed to sync with cloud. Check your connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setSyncState("failed");
      toast({
        title: "Sync error",
        description: "An error occurred during synchronization",
        variant: "destructive",
      });
    }
  };

  // Format the last sync time nicely
  const formatLastSync = () => {
    if (!lastSyncTime) return "Never";

    try {
      const date = new Date(lastSyncTime);
      return date.toLocaleTimeString();
    } catch (e) {
      return "Unknown";
    }
  };

  // Don't show anything if user isn't logged in
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {syncState === "disabled" && (
        <CloudOff className="h-4 w-4 text-muted-foreground" />
      )}
      {syncState === "synced" && <Cloud className="h-4 w-4 text-green-500" />}
      {syncState === "failed" && <CloudOff className="h-4 w-4 text-red-500" />}
      {syncState === "syncing" && (
        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      )}

      <span className="text-xs text-muted-foreground hidden sm:inline">
        {syncState === "disabled"
          ? "Cloud sync disabled"
          : `Last sync: ${formatLastSync()}`}
      </span>

      {syncState !== "disabled" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleManualSync}
          disabled={syncState === "syncing"}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
