"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only run on client-side
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    if (!hasAcceptedCookies) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="container mx-auto max-w-screen-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 text-sm pr-2">
            <p className="mb-1 font-medium">This website uses cookies</p>
            <p className="text-muted-foreground">
              We use cookies to provide you with the best experience on our
              website. Read our{" "}
              <Link
                href="/privacy-policy"
                className="underline hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>
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
