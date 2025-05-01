"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * A component that automatically redirects to the MFA verification page
 * if challenge ID information is available in storage
 */
export function MfaAutoRedirect() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [challengeId, setChallengeId] = useState<string>("");

  // Monitor console output to find challenge ID
  useEffect(() => {
    // Check if we have MFA challenge info stored
    if (typeof window !== 'undefined') {
      // Helper function to get a cookie value
      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      
      // Function to extract challenge ID from log message
      const findChallengeIdInPage = () => {
        // Check HTML content for any challenge ID mentions
        const pageContent = document.body.innerText || '';
        const challengeMatches = pageContent.match(/CHALLENGE ID: ([a-zA-Z0-9]+)/);
        if (challengeMatches && challengeMatches[1]) {
          return challengeMatches[1];
        }
        return null;
      };
      
      // Check all possible sources for challenge ID
      const lsChallengeId = localStorage.getItem("mfa_challenge_id"); 
      const ssChallengeId = sessionStorage.getItem("mfa_challenge_id");
      const cookieChallengeId = getCookie("mfa_challenge_id");
      const pageChallengeId = findChallengeIdInPage();
      
      // Combine with || for finding any source
      const foundChallengeId = lsChallengeId || ssChallengeId || cookieChallengeId || pageChallengeId;
      
      console.log("[MFA Auto Redirect] Challenge ID sources:", {
        localStorage: lsChallengeId,
        sessionStorage: ssChallengeId,
        cookie: cookieChallengeId,
        page: pageChallengeId,
        final: foundChallengeId
      });
      
      if (foundChallengeId) {
        setChallengeId(foundChallengeId);
        
        // Store in all locations for redundancy
        localStorage.setItem("mfa_challenge_id", foundChallengeId);
        sessionStorage.setItem("mfa_challenge_id", foundChallengeId);
        document.cookie = `mfa_challenge_id=${foundChallengeId}; path=/; max-age=3600; SameSite=Strict`;
        
        // Email collection similarly
        const lsEmail = localStorage.getItem("mfa_email"); 
        const ssEmail = sessionStorage.getItem("mfa_email");
        const cookieEmail = getCookie("mfa_email");
        const email = lsEmail || ssEmail || cookieEmail || "";
        
        // Check if we're already on the verify-mfa page
        if (!window.location.pathname.includes("verify-mfa")) {
          setIsRedirecting(true);
          
          // Construct URL for redirection - explicitly include challengeId in the URL
          const safeVerifyUrl = `/verify-mfa?challengeId=${encodeURIComponent(foundChallengeId)}`;
          const fullVerifyUrl = email 
            ? `${safeVerifyUrl}&email=${encodeURIComponent(email)}` 
            : safeVerifyUrl;
          
          console.log("[MFA Auto Redirect] Redirecting to:", fullVerifyUrl);
          console.log("[MFA Auto Redirect] Challenge ID being passed:", foundChallengeId);
          
          // For debugging, show the challenge ID being passed
          alert(`MFA required. Redirecting with Challenge ID: ${foundChallengeId}`);
          
          // Use replace for cleaner navigation history - USE HARD NAVIGATION
          window.location.replace(fullVerifyUrl);
          
          // Fallback with setTimeout
          setTimeout(() => {
            if (!window.location.pathname.includes("verify-mfa")) {
              console.log("[MFA Auto Redirect] Fallback redirect");
              window.location.href = fullVerifyUrl;
            }
          }, 1000);
        }
      }
    }
  }, [router]);
  
  // Poll continuously for challenge IDs that appear after initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && !challengeId) {
      const intervalId = setInterval(() => {
        // Check for new challenge IDs in storage
        const newChallengeId = 
          localStorage.getItem("mfa_challenge_id") || 
          sessionStorage.getItem("mfa_challenge_id");
          
        if (newChallengeId) {
          setChallengeId(newChallengeId);
          clearInterval(intervalId);
        }
      }, 500);  // Check every 500ms
      
      // Clear interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [challengeId]);

  // If not redirecting, don't render anything
  if (!isRedirecting) return null;

  // Show a loading indicator while redirecting
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Redirecting to Verification</h2>
        <p className="text-center text-muted-foreground">
          You need to complete two-factor authentication.
          <br />
          Please wait while we redirect you to the verification page...
        </p>
        {challengeId && (
          <div className="mt-4 p-3 bg-background border rounded text-center">
            <p className="text-sm font-medium">Challenge ID:</p>
            <p className="text-lg font-mono">{challengeId}</p>
          </div>
        )}
      </div>
    </div>
  );
}