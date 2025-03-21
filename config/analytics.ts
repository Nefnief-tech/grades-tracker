/**
 * Plausible Analytics configuration
 */

// Your Plausible instance URL (use HTTPS)
export const PLAUSIBLE_URL = "https://plausible.nief.tech";

// Domain being tracked - change this to your actual domain
export const PLAUSIBLE_DOMAIN = "nief.tech";

// Enable/disable analytics in development
export const ANALYTICS_ENABLED_IN_DEV = false;

// Check if analytics should be enabled
export const isAnalyticsEnabled = () => {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "development" && !ANALYTICS_ENABLED_IN_DEV)
    return false;

  // Check if user has opted out (from your cookie consent)
  const cookieConsent = localStorage.getItem("cookieConsent");
  if (cookieConsent === "declined") return false;

  return true;
};
