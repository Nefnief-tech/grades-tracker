import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSubjectsFromStorage,
  clearCacheForRefresh,
} from "@/utils/storageUtils";
import { fetchSubjectsWithGrades, clearCache } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject } from "@/types/grades";
// Import the processor to ensure grades are correctly processed
import { processSubjectsWithGrades } from "@/utils/gradeProcessor";

// Debug flag to force using defaults for encrypted values
// This can be toggled in the browser console: window.DEBUG_USE_DEFAULTS_FOR_ENCRYPTED = true
declare global {
  interface Window {
    DEBUG_USE_DEFAULTS_FOR_ENCRYPTED: boolean;
    DEBUG_SHOW_RAW_SUBJECTS: () => void;
    DEBUG_SUBJECTS: any;
  }
}

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
  const fetchSubjects = useCallback(async (forceRefresh = false) => {
    // EXTREME throttling to prevent excessive fetches
    if (fetchInProgressRef.current) {
      console.log("BLOCKED - Fetch already in progress");
      return;
    }
    
    // Import grade fixers here to avoid circular dependencies
    const { fixAllSubjectsGrades } = require('@/utils/gradeFixers');
    
    if (!user) {
      setSubjects([]);
      setIsLoading(false);
      return;
    }

    // If user is forcing a cloud refresh, use the new data service
    if (forceRefresh && user.syncEnabled && user.id) {
      try {
        console.log("Using data service fetch on force refresh");
        setIsLoading(true);
        
        // Clear service cache if forced refresh
        if (forceRefresh) {
          clearCache();
        }
          
        const subjectsWithGrades = await fetchSubjectsWithGrades(user.id);
        if (subjectsWithGrades && subjectsWithGrades.length > 0) {
          // Apply grade fixes before using
          const fixedSubjects = fixAllSubjectsGrades(subjectsWithGrades);
          console.log(`Fixed ${fixedSubjects.length} fetched subjects for display`);
          
          setSubjects(fixedSubjects);
          console.log(`Retrieved ${fixedSubjects.length} subjects with grades`);
          
          // Save to local storage for future use
          localStorage.setItem("gradeCalculator", JSON.stringify(fixedSubjects));
          setIsLoading(false);
          fetchInProgressRef.current = false;
          lastFetchTimeRef.current = Date.now();
          return;
        }
      } catch (error) {
        console.error("Error using enhanced data service, falling back:", error);
      }
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
              // Fix any grade display issues
              const fixedSubjects = fixAllSubjectsGrades(localSubjects);
              console.log(`Fixed ${fixedSubjects.length} local subjects for display`);
              
              setSubjects(fixedSubjects);
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
      
      // Process subjects using our dedicated utility to ensure grades display properly
      const processedSubjects = processSubjectsWithGrades(fetchedSubjects);
      console.log(`Processed ${processedSubjects.length} subjects with grades for display`);
      
      // Count grades for debugging
      const totalGrades = processedSubjects.reduce((total, subject) => total + (subject.grades?.length || 0), 0);
      console.log(`Total grades across all subjects: ${totalGrades}`);
      
      setSubjects(processedSubjects);
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
  }, [user]);

  // Refresh subjects function for external components
  const refreshSubjects = useCallback(async () => {
    if (!user || !user.id || !user.syncEnabled) {
      return fetchSubjects(true);
    }
    
    setIsLoading(true);
    
    try {
      // Use our data service to get subjects with grades directly
      clearCache(); // Force fresh data
      const subjectsWithGrades = await fetchSubjectsWithGrades(user.id);
      
      if (subjectsWithGrades && subjectsWithGrades.length > 0) {
        // Update state
        setSubjects(subjectsWithGrades);
        // Save to local storage
        localStorage.setItem("gradeCalculator", JSON.stringify(subjectsWithGrades));
        console.log(`Refresh complete: ${subjectsWithGrades.length} subjects with grades`);
      } else {
        // Fall back to regular fetch
        fetchSubjects(true);
      }
    } catch (error) {
      console.error("Error in direct refresh:", error);
      // Fall back to regular fetch
      fetchSubjects(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubjects, user]);

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