import { useState, useEffect, useCallback, useRef } from "react";
import { getSubjectsFromStorage } from "@/utils/storageUtils";
import { useAuth } from "@/contexts/AuthContext";
import { throttle, markExecuted } from "@/lib/throttle";

// Create a shared data cache for faster access across instances
const globalSubjectsCache = {
  subjects: [] as any[],
  timestamp: 0,
};

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of mounted state to prevent updates after unmount
  const isMounted = useRef(true);

  // Keep track of fetch count to prevent excessive fetching
  const fetchCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clear any pending timeout on unmount
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Create a throttled key using userId
  const getThrottleKey = useCallback(() => {
    return `subjects-fetch-${user?.id || "anonymous"}`;
  }, [user?.id]);

  // Fetcher function with local caching and optimizations
  const fetchSubjects = useCallback(
    async (forceRefresh = false) => {
      if (!user) return [];

      // Extreme throttling for non-forced fetches - only fetch every 30 seconds
      const throttleInterval = 30000; // 30 seconds
      const now = Date.now();

      if (!forceRefresh) {
        // Use a simple time-based throttle as a backup
        if (now - lastFetchTimeRef.current < throttleInterval) {
          console.log(
            `Throttling fetch - last fetch was ${
              (now - lastFetchTimeRef.current) / 1000
            }s ago`
          );
          return globalSubjectsCache.subjects.length > 0
            ? globalSubjectsCache.subjects
            : subjects;
        }
      }

      const throttleKey = getThrottleKey();

      // Use global cache if recent and not forced refresh - with a longer validity period of 10 seconds
      if (
        !forceRefresh &&
        globalSubjectsCache.subjects.length > 0 &&
        now - globalSubjectsCache.timestamp < 10000
      ) {
        if (isMounted.current) {
          setSubjects(globalSubjectsCache.subjects);
          setIsLoading(false);
        }
        return globalSubjectsCache.subjects;
      }

      // Only allow fetch once every 30 seconds unless forced
      if (!forceRefresh && !throttle(throttleKey, throttleInterval, false)) {
        console.log("Fetch throttled - using cached data");
        return globalSubjectsCache.subjects.length > 0
          ? globalSubjectsCache.subjects
          : subjects;
      }

      // Track fetch count and time
      fetchCountRef.current += 1;
      lastFetchTimeRef.current = now;

      console.log(`Fetching subjects (count: ${fetchCountRef.current})`);

      if (isMounted.current) setIsLoading(true);

      // Mark as executed at the start
      markExecuted(throttleKey);

      try {
        const fetchedSubjects = await getSubjectsFromStorage(
          user.id,
          user.syncEnabled
        );

        // Update global cache
        globalSubjectsCache.subjects = fetchedSubjects;
        globalSubjectsCache.timestamp = now;

        if (isMounted.current) {
          setSubjects(fetchedSubjects);
          setIsLoading(false);
        }
        return fetchedSubjects;
      } catch (err) {
        console.error("Error fetching subjects:", err);
        if (isMounted.current) {
          setError(err as Error);
          setIsLoading(false);
        }
        return [];
      }
    },
    [user, getThrottleKey, subjects]
  );

  // Initial data loading and event listeners - with improved debouncing
  useEffect(() => {
    // Only fetch if we don't already have subjects in the cache
    if (globalSubjectsCache.subjects.length === 0) {
      fetchSubjects();
    } else if (globalSubjectsCache.subjects.length > 0 && isMounted.current) {
      // Use cached subjects immediately to avoid loading state
      setSubjects(globalSubjectsCache.subjects);
      setIsLoading(false);
    }

    const handleUpdates = () => {
      // Use a longer debounce (1 second) to avoid multiple rapid refreshes
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        // Only force refresh for significant events
        fetchSubjects(true);
      }, 1000);
    };

    window.addEventListener("syncPreferenceChanged", handleUpdates);
    window.addEventListener("subjectsUpdated", handleUpdates);

    return () => {
      window.removeEventListener("syncPreferenceChanged", handleUpdates);
      window.removeEventListener("subjectsUpdated", handleUpdates);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchSubjects]);

  // Refresh function that respects loading state and uses less aggressive forcing
  const refreshSubjects = useCallback(() => {
    if (isLoading) return Promise.resolve(subjects);

    // Current time - for throttling even manual refreshes
    const now = Date.now();
    // Only allow manual refresh every 5 seconds
    if (now - lastFetchTimeRef.current < 5000) {
      console.log("Manual refresh throttled");
      return Promise.resolve(subjects);
    }

    lastFetchTimeRef.current = now;
    return fetchSubjects(true);
  }, [fetchSubjects, isLoading, subjects]);

  return {
    subjects,
    isLoading,
    error,
    refreshSubjects,
    mutate: refreshSubjects,
  };
}
