"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Track page views without using useSearchParams
  useEffect(() => {
    // Only track when pathname is available
    if (pathname) {
      try {
        // Use window.location.search directly to avoid useSearchParams
        const url = pathname + window.location.search;

        // Track page view
        trackPageView(url);
      } catch (error) {
        console.error("Error tracking page view:", error);
        // Fallback to just pathname
        trackPageView(pathname);
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
