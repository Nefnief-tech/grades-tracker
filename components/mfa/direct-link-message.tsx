"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function MfaDirectLinkMessage() {
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check for MFA details in storage
    try {
      const localEmail = localStorage.getItem("mfa_email");
      const localChallengeId = localStorage.getItem("mfa_challenge_id");
      
      if (localEmail && localChallengeId) {
        setEmail(localEmail);
        setChallengeId(localChallengeId);
        setVisible(true);
        return;
      }
      
      const sessionEmail = sessionStorage.getItem("mfa_email");
      const sessionChallengeId = sessionStorage.getItem("mfa_challenge_id");
      
      if (sessionEmail && sessionChallengeId) {
        setEmail(sessionEmail);
        setChallengeId(sessionChallengeId);
        setVisible(true);
        return;
      }
      
      // Check cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
        return "";
      };
      
      const cookieEmail = getCookie("mfa_email");
      const cookieChallengeId = getCookie("mfa_challenge_id");
      
      if (cookieEmail && cookieChallengeId) {
        setEmail(cookieEmail);
        setChallengeId(cookieChallengeId);
        setVisible(true);
      }
    } catch (e) {
      console.error("Error checking for MFA details:", e);
    }
  }, []);

  if (!visible || !email || !challengeId) {
    return null;
  }

  const verifyUrl = `/mfa-verify.html?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
      <AlertTitle className="text-amber-800">MFA Verification Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          A verification code has been sent to your email. Please click the link below to complete verification:
        </p>
        <div className="mb-2">
          <Input 
            readOnly
            value={verifyUrl}
            className="bg-white text-xs font-mono mb-2"
          />
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href={verifyUrl} className="flex items-center justify-center gap-1">
              Open Verification Page <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}