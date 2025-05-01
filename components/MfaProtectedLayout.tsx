"use client";

import React, { useEffect } from "react";
import { MfaDetector } from "@/components/mfa/mfa-detector";
import { MfaAutoRedirect } from "@/components/mfa/auto-redirect";

export default function MfaProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set up console intercept to capture MFA challenge IDs
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    // Function to extract challenge ID from log message
    const extractChallengeId = (args: any[]) => {
      if (!args.length) return null;
      
      // Convert all arguments to string and join
      const logString = args.join(" ");
      
      // Look for challenge ID in the log
      if (logString.includes("CHALLENGE ID:")) {
        const match = logString.match(/CHALLENGE ID: ([a-zA-Z0-9]+)/);
        if (match && match[1]) {
          const challengeId = match[1];
          
          // Store in both storage types for redundancy
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('mfa_challenge_id', challengeId);
              sessionStorage.setItem('mfa_challenge_id', challengeId);
              document.cookie = `mfa_challenge_id=${challengeId}; path=/; max-age=3600; SameSite=Strict`;
              
              // Look for email in the message too
              const emailMatch = logString.match(/email=([^&]+)/);
              if (emailMatch && emailMatch[1]) {
                const email = decodeURIComponent(emailMatch[1]);
                localStorage.setItem('mfa_email', email);
                sessionStorage.setItem('mfa_email', email);
                document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
              }
              
              // If we have successfully stored the challenge ID, redirect to the verification page
              if (window.location.pathname !== '/verify-mfa') {
                window.location.href = `/verify-mfa?challengeId=${challengeId}`;
              }
              
              return challengeId;
            } catch (e) {
              console.error('[MFA Layout] Error storing challenge ID:', e);
            }
          }
        }
      }
      return null;
    };
    
    // Override console.log to capture challenge IDs
    console.log = function(...args: any[]) {
      // Call original console.log first
      originalConsoleLog.apply(console, args);
      
      // Extract and store challenge ID if present
      extractChallengeId(args);
    };
    
    // Clean up when unmounting
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
  return (
    <>
      {/* Automatic redirect to verification page if MFA is required */}
      <MfaAutoRedirect />
      
      {/* MFA detector UI that shows when MFA is required */}
      <MfaDetector />
      
      {children}
    </>
  );
}