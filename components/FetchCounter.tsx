"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function FetchCounter() {
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    const originalFetch = window.fetch;

    // Override fetch to count API calls
    window.fetch = function (...args) {
      setFetchCount((prev) => prev + 1);
      return originalFetch.apply(this, args);
    };

    // Add a listener for storage operations
    const handleStorage = () => {
      setFetchCount((prev) => prev + 1);
    };

    window.addEventListener("subjectsUpdated", handleStorage);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("subjectsUpdated", handleStorage);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Badge className="fixed bottom-4 left-4 z-50">Fetches: {fetchCount}</Badge>
  );
}
