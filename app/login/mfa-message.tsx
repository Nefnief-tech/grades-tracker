"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function MfaMessage() {
  const [email, setEmail] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have MFA challenge details stored
    try {
      // Check localStorage first
      const storedEmail = localStorage.getItem("mfa_email");
      const storedChallengeId = localStorage.getItem("mfa_challenge_id");
      
      if (storedEmail && storedChallengeId) {
        setEmail(storedEmail);
        setChallengeId(storedChallengeId);
        setVisible(true);
        return;
      }
      
      // Try sessionStorage next
      const sessionEmail = sessionStorage.getItem("mfa_email");
      const sessionChallengeId = sessionStorage.getItem("mfa_challenge_id");
      
      if (sessionEmail && sessionChallengeId) {
        setEmail(sessionEmail);
        setChallengeId(sessionChallengeId);
        setVisible(true);
        return;
      }
      
      // Try cookies last
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
      console.error("Error checking MFA storage:", e);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "You can now paste the text wherever you need it"
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  const staticPageUrl = `/mfa-verify.html?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 dark:bg-amber-900 p-4">
      <Card className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 h-5 w-5 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-sm">Two-Factor Authentication Required</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              A verification code has been sent to your email. Click the link below to verify your account:
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Input 
                className="font-mono text-xs"
                readOnly
                value={staticPageUrl}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(window.location.origin + staticPageUrl)}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVisible(false)}
              >
                Dismiss
              </Button>
              
              <Button
                size="sm"
                className="gap-1"
                asChild
              >
                <Link href={staticPageUrl}>
                  Go to verification page
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}