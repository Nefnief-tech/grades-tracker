"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Shield, Cookie } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only run on client-side
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    if (!hasAcceptedCookies) {
      // Delay showing the banner to not interfere with initial load experience
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);

    // If Plausible is available, notify it about the consent
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Consent: Accepted");
    }
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);

    // If using analytics, disable them
    if (typeof window !== "undefined") {
      // Set a flag that can be checked by analytics code
      localStorage.setItem("analyticsDisabled", "true");

      // If using Plausible, track the opt-out
      if (window.plausible) {
        window.plausible("Consent: Declined");
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg">
      <div className="container mx-auto max-w-screen-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 text-sm pr-2">
              <p className="mb-1 font-medium">This website uses cookies</p>
              <p className="text-muted-foreground">
                We use cookies to provide core functionality and improve your
                experience. By clicking "Accept", you consent to the use of
                necessary cookies. Read our{" "}
                <Link
                  href="/privacy-policy"
                  className="underline hover:text-primary transition-colors font-medium"
                >
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>
                  Your data is processed securely and never shared with third
                  parties
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-center">
            <Button variant="outline" size="sm" onClick={declineCookies}>
              Decline
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="bg-primary hover:bg-primary/90"
            >
              Accept
            </Button>
          </div>
          <button
            onClick={declineCookies}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
