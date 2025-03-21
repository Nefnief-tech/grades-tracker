"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trackPageView } from "@/utils/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Only use searchParams on the client side
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // This effect will only run on the client
    if (pathname) {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const search = searchParams.toString();
        const fullUrl = search ? `${pathname}?${search}` : pathname;
        
        setUrl(fullUrl);
        trackPageView(fullUrl);
      } catch (error) {
        console.error("Error tracking page view:", error);
        // Fallback to just pathname
        trackPageView(pathname);
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
