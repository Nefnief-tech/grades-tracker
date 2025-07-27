"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { trackActivity, trackFeature, trackCustomEvent } = useAnalytics({
    trackPageViews: true,
    trackPerformance: true,
    trackErrors: true,
    sessionTimeout: 30,
  });

  // Track application initialization
  useEffect(() => {
    trackCustomEvent("app_init", { timestamp: Date.now() });
  }, [trackCustomEvent]);

  // Add global event listeners for common user interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Track button clicks
      if (target.tagName === "BUTTON") {
        const buttonText = target.textContent?.trim() || "unknown_button";
        trackActivity("button_click", "ui_interaction", { button: buttonText });
      }

      // Track link clicks
      if (target.tagName === "A" || target.closest("a")) {
        const link = target.closest("a") as HTMLAnchorElement;
        const href = link?.href || "unknown_link";
        trackActivity("link_click", "navigation", { href });
      }
    };

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || "unknown_form";
      trackActivity("form_submit", "form_interaction", { form: formId });
    };

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      // Track common keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        trackActivity("keyboard_shortcut", "productivity", { shortcut: "save" });
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        trackActivity("keyboard_shortcut", "productivity", { shortcut: "undo" });
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleFormSubmit);
    document.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleFormSubmit);
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [trackActivity]);

  // Expose tracking functions globally for manual tracking
  useEffect(() => {
    // Add to window object for easy access in other components
    (window as any).analytics = {
      trackActivity,
      trackFeature,
      trackCustomEvent,
    };
  }, [trackActivity, trackFeature, trackCustomEvent]);

  return <>{children}</>;
}

// Hook for manual tracking in components
export function useAppAnalytics() {
  const { trackActivity, trackFeature, trackCustomEvent, isTracking } = useAnalytics();

  const trackGradeAction = (action: string, metadata?: any) => {
    trackFeature("grades", action, metadata);
  };

  const trackSubjectAction = (action: string, metadata?: any) => {
    trackFeature("subjects", action, metadata);
  };

  const trackTeamAction = (action: string, metadata?: any) => {
    trackFeature("teams", action, metadata);
  };

  const trackAnalyticsAction = (action: string, metadata?: any) => {
    trackFeature("analytics", action, metadata);
  };

  const trackNavigation = (page: string) => {
    trackActivity("navigate", "navigation", { page });
  };

  const trackSearch = (query: string, results?: number) => {
    trackActivity("search", "search", { query, results });
  };

  const trackError = (error: string, context?: any) => {
    trackCustomEvent("user_error", { error, context });
  };

  return {
    isTracking,
    trackActivity,
    trackFeature,
    trackCustomEvent,
    trackGradeAction,
    trackSubjectAction,
    trackTeamAction,
    trackAnalyticsAction,
    trackNavigation,
    trackSearch,
    trackError,
  };
}
