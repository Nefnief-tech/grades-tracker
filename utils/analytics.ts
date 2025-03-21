/**
 * Utility functions for Plausible Analytics
 */
import { isAnalyticsEnabled, PLAUSIBLE_DOMAIN } from "@/config/analytics";

/**
 * Track a custom event with Plausible Analytics
 * @param eventName The name of the event to track
 * @param props Optional properties to include with the event
 */
export const trackEvent = (
  eventName: string,
  props?: Record<string, any>
): void => {
  // Only run if analytics is enabled
  if (!isAnalyticsEnabled()) return;

  if (typeof window !== "undefined" && window.plausible) {
    try {
      window.plausible(eventName, { props });

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Analytics: Tracked event "${eventName}"`, props);
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }
};

/**
 * Track a page view with Plausible Analytics
 * @param url The URL to track (defaults to current URL)
 */
export const trackPageView = (url?: string): void => {
  // Only run if analytics is enabled
  if (!isAnalyticsEnabled()) return;

  if (typeof window !== "undefined" && window.plausible) {
    try {
      window.plausible("pageview", {
        u: url || window.location.href,
      });

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Analytics: Tracked pageview for "${url || window.location.href}"`
        );
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }
};

// Add TypeScript declaration for the plausible global variable
declare global {
  interface Window {
    plausible?: (eventName: string, options?: any) => void;
  }
}
