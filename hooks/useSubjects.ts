import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSubjectsFromStorage,
  clearCacheForRefresh,
} from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject } from "@/types/grades";

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchTimeRef = useRef(0);
  // Use a ref to track in-flight fetches to prevent loops
  const fetchInProgressRef = useRef(false);
  // Keep track of event handlers to avoid duplicates
  const eventBoundRef = useRef(false);

  // Function to fetch subjects with optional force refresh
  const fetchSubjects = useCallback(
    async (forceRefresh = false) => {
      // IMPORTANT: Prevent fetch loops by checking if already in progress
      if (fetchInProgressRef.current && !forceRefresh) {
        console.log("Fetch already in progress, skipping");
        return;
      }

      if (!user) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      // Maximum throttle - 30 seconds between fetches unless forced
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTimeRef.current < 30000) {
        // 30 seconds
        console.log(
          "HARD THROTTLE - Skipping fetch, last fetch was only",
          ((now - lastFetchTimeRef.current) / 1000).toFixed(1) + "s ago"
        );
        return;
      }

      try {
        // Set fetch in progress flag BEFORE any async operations
        fetchInProgressRef.current = true;
        lastFetchTimeRef.current = now;

        // Track operation with a unique ID to help debug
        const fetchId = `fetch-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        console.log(`Starting subject fetch (ID: ${fetchId})`);

        setIsLoading(true);

        if (forceRefresh) {
          console.log(`Force refresh requested (ID: ${fetchId})`);
          clearCacheForRefresh();
        }

        const fetchedSubjects = await getSubjectsFromStorage(
          user.id,
          user.syncEnabled,
          forceRefresh
        );

        // Check if we're still relevant (no newer fetch started)
        if (lastFetchTimeRef.current !== now) {
          console.log(
            `Fetch ${fetchId} superseded by newer fetch, discarding results`
          );
          return;
        }

        console.log(
          `Fetch completed (ID: ${fetchId}) with ${fetchedSubjects.length} subjects`
        );
        setSubjects(fetchedSubjects);
        setError(null);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        // Use a MUCH longer delay to prevent fetch loops - 15 seconds minimum
        setTimeout(() => {
          console.log("Unlocking fetch after extended cooldown period");
          fetchInProgressRef.current = false;
        }, 15000); // 15 seconds
        setIsLoading(false);
      }
    },
    [user]
  );

  // Refresh subjects function for external components
  const refreshSubjects = useCallback(() => {
    fetchSubjects(true);
  }, [fetchSubjects]);

  // Fetch on component mount and user change - ONCE only
  useEffect(() => {
    if (user && !fetchInProgressRef.current) {
      console.log("Initial fetch from useEffect");
      fetchSubjects(true); // Force refresh on initial load
    }
  }, [user, fetchSubjects]);

  // CRITICAL FIX: Only listen for specific events with clean handling
  useEffect(() => {
    // Only set up listener if we don't already have one and the user is logged in
    if (eventBoundRef.current || !user) return;
    eventBoundRef.current = true;

    console.log("Setting up subject update event listener");

    // Track when we last processed an event
    let lastEventProcessedTime = 0;

    // Handle subjects updated events with strong throttling
    const handleEvent = () => {
      const now = Date.now();

      // 15 second cooldown between event processing
      if (now - lastEventProcessedTime < 15000) {
        console.log("Ignoring event - too soon after previous (15s cooldown)");
        return;
      }

      lastEventProcessedTime = now;

      // If fetch is already in progress, don't trigger another one
      if (fetchInProgressRef.current) {
        console.log("Fetch already in progress, not triggering from event");
        return;
      }

      console.log("Processing subjects updated event, scheduling fetch");

      // Schedule a refresh with a delay
      setTimeout(() => {
        if (!fetchInProgressRef.current) {
          fetchSubjects(false); // Don't force refresh to use cache when possible
        }
      }, 2000); // 2 second delay
    };

    // Only listen for subjectsUpdated events
    window.addEventListener("subjectsUpdated", handleEvent);

    return () => {
      window.removeEventListener("subjectsUpdated", handleEvent);
      eventBoundRef.current = false;
    };
  }, [user, fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    refreshSubjects,
  };
}
