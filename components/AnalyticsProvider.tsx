"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    // Only track when pathname is available
    if (pathname) {
      // Include search parameters if present
      let url = pathname;
      const search = searchParams?.toString();
      if (search) url += `?${search}`;

      // Track page view
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
