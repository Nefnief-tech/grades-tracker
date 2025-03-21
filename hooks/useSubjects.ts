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
      // EXTREME throttling to prevent excessive fetches
      if (fetchInProgressRef.current) {
        console.log("BLOCKED - Fetch already in progress");
        return;
      }

      if (!user) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      // Only allow one fetch per minute unless explicitly forced by user action
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTimeRef.current < 60000) {
        // 1 minute
        console.log("EXTREME THROTTLE - Only one fetch per minute allowed");
        return;
      }

      try {
        // Set fetch in progress flag BEFORE any async operations
        fetchInProgressRef.current = true;
        lastFetchTimeRef.current = now;

        const fetchId = `fetch-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        console.log(`Starting critical subject fetch (ID: ${fetchId})`);

        setIsLoading(true);

        // Only clear cache on explicit user refresh
        if (forceRefresh) {
          console.log(`Force refresh requested (ID: ${fetchId})`);
          clearCacheForRefresh();
        }

        // Use localStorage first if available
        const localStorageKey = "gradeCalculator";
        if (
          !forceRefresh &&
          typeof window !== "undefined" &&
          window.localStorage
        ) {
          try {
            const localData = localStorage.getItem(localStorageKey);
            if (localData) {
              const localSubjects = JSON.parse(localData);
              if (Array.isArray(localSubjects) && localSubjects.length > 0) {
                console.log(
                  `Using fast local data: ${localSubjects.length} subjects`
                );
                setSubjects(localSubjects);
                setIsLoading(false);

                // Get cloud data in background without blocking UI
                if (forceRefresh) {
                  setTimeout(() => {
                    getSubjectsFromStorage(user.id, user.syncEnabled, true)
                      .then((cloudSubjects) => {
                        setSubjects(cloudSubjects);
                        console.log(
                          `Updated with cloud data: ${cloudSubjects.length} subjects`
                        );
                      })
                      .catch((e) =>
                        console.error("Background cloud fetch failed:", e)
                      )
                      .finally(() => {
                        fetchInProgressRef.current = false;
                      });
                  }, 500);
                  return;
                }
              }
            }
          } catch (e) {
            console.error("Error using local data:", e);
          }
        }

        // If we get here, either forceRefresh is true or we don't have local data
        const fetchedSubjects = await getSubjectsFromStorage(
          user.id,
          user.syncEnabled,
          forceRefresh
        );

        console.log(
          `Fetch completed (ID: ${fetchId}) with ${fetchedSubjects.length} subjects`
        );
        setSubjects(fetchedSubjects);
        setError(null);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        // Allow new fetches after a delay
        setTimeout(() => {
          fetchInProgressRef.current = false;
        }, 5000); // 5 seconds is enough
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

  // Almost completely disable automatic event-based updates
  useEffect(() => {
    if (eventBoundRef.current || !user) return;
    eventBoundRef.current = true;

    console.log("Setting up MINIMAL event listener");

    // Only update on explicit subjectsUpdated events
    const handleEvent = () => {
      // Don't trigger any fetch - just inform the user refresh is available
      console.log("Data changed - refresh button will allow updating");
    };

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
