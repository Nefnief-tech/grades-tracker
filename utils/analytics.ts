/**
 * Utility functions for privacy-respecting analytics
 */
import { isAnalyticsEnabled, PLAUSIBLE_DOMAIN } from "@/config/analytics";

/**
 * Check if analytics should be enabled based on user consent
 * @returns boolean indicating if analytics should be enabled
 */
const shouldEnableAnalytics = (): boolean => {
  // First check if analytics are enabled in the config
  if (!isAnalyticsEnabled()) return false;

  // Then check user consent
  if (typeof window !== "undefined") {
    // Check if user has explicitly declined cookies/analytics
    const cookieConsent = localStorage.getItem("cookieConsent");
    const analyticsDisabled = localStorage.getItem("analyticsDisabled");

    if (cookieConsent === "declined" || analyticsDisabled === "true") {
      return false;
    }

    // If in the EU, require explicit consent
    if (
      localStorage.getItem("isEUVisitor") === "true" &&
      cookieConsent !== "accepted"
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Track a custom event with privacy-respecting analytics
 * @param eventName The name of the event to track
 * @param props Optional properties to include with the event
 */
export const trackEvent = (
  eventName: string,
  props?: Record<string, any>
): void => {
  // Only run if analytics is enabled and user has consented
  if (!shouldEnableAnalytics()) return;

  // Never track personal information
  if (props) {
    // Remove any potentially sensitive data
    const safeProps = { ...props };
    ["email", "name", "fullName", "password", "personalData", "userId"].forEach(
      (key) => {
        if (key in safeProps) {
          delete safeProps[key];
        }
      }
    );

    // Only track safe props
    props = safeProps;
  }

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
 * Track a page view with privacy-respecting analytics
 * @param url The URL to track (defaults to current URL)
 */
export const trackPageView = (url?: string): void => {
  // Only run if analytics is enabled and user has consented
  if (!shouldEnableAnalytics()) return;

  if (typeof window !== "undefined" && window.plausible) {
    try {
      // Remove any query parameters that might contain personal information
      let cleanUrl = url || window.location.href;
      try {
        const urlObj = new URL(cleanUrl);

        // Remove sensitive query parameters
        ["email", "name", "id", "user", "token"].forEach((param) => {
          urlObj.searchParams.delete(param);
        });

        cleanUrl = urlObj.toString();
      } catch (e) {
        // URL parsing failed, use the original
      }

      window.plausible("pageview", {
        u: cleanUrl,
      });

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Analytics: Tracked pageview for "${cleanUrl}"`);
      }
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }
};

/**
 * Set up necessary privacy protection for the visitor
 * Detects EU visitors to apply stronger privacy protection
 */
export const setupPrivacyProtection = (): void => {
  if (typeof window === "undefined") return;

  // Detect if visitor is likely from the EU (simplistic approach)
  // A more accurate approach would be to use a geolocation service
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      "Europe/", // All European timezones start with Europe/
    ];

    const isEUVisitor = euTimezones.some((tz) => timezone.startsWith(tz));

    // Store this information for future reference
    localStorage.setItem("isEUVisitor", isEUVisitor.toString());

    // For EU visitors, we'll require explicit consent before enabling analytics
    if (isEUVisitor && !localStorage.getItem("cookieConsent")) {
      // This will force the cookie banner to show and require consent
      localStorage.removeItem("analyticsDisabled");
    }
  } catch (e) {
    console.error("Error detecting timezone:", e);
  }
};

// Add TypeScript declaration for the plausible global variable
declare global {
  interface Window {
    plausible?: (eventName: string, options?: any) => void;
  }
}
