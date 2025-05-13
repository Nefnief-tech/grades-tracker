"use client";

import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function MfaDetector() {
  const [challengeId, setChallengeId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there are errors or traces in console related to MFA
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    function checkForMfaChallenge(args: any[]) {
      if (args.length > 0) {
        const logString = args.join(" ");
        
        // Look for challenge ID in logs
        if (logString.includes("CHALLENGE ID:")) {
          const match = logString.match(/CHALLENGE ID: ([a-zA-Z0-9]+)/);
          if (match && match[1]) {
            setChallengeId(match[1]);
            setVisible(true);
          }
        }
      }
    }

    // Override console methods
    console.log = function(...args: any[]) {
      originalConsoleLog.apply(console, args);
      checkForMfaChallenge(args);
    };

    console.error = function(...args: any[]) {
      originalConsoleError.apply(console, args);
      
      // Check for common MFA error messages
      if (args.length > 0) {
        const errorString = args.join(" ");
        if (
          errorString.includes("More factors are required") || 
          errorString.includes("MFA") || 
          errorString.includes("verification")
        ) {
          setVisible(true);
        }
      }
    };

    // Also look for stored MFA challenge details
    const storedChallengeId = 
      localStorage.getItem("mfa_challenge_id") || 
      sessionStorage.getItem("mfa_challenge_id");
    
    const storedEmail = 
      localStorage.getItem("mfa_email") || 
      sessionStorage.getItem("mfa_email");

    if (storedChallengeId) {
      setChallengeId(storedChallengeId);
      if (storedEmail) {
        setEmail(storedEmail);
      }
      setVisible(true);
    }

    // Clean up
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  if (!visible) return null;

  const verifyUrl = `/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Text has been copied to your clipboard"
        });
      })
      .catch(err => {
        console.error("Failed to copy:", err);
      });
  };

  return (
    <Alert variant="destructive" className="mb-6 fixed top-4 left-4 right-4 z-50 max-w-3xl mx-auto">
      <AlertTitle className="text-lg font-bold flex items-center gap-2">
        MFA Verification Required
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">
          You need to complete two-factor authentication. Click the button below to go to the verification page.
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input 
              readOnly 
              value={`Challenge ID: ${challengeId}`}
              className="font-mono text-xs bg-background/30"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(challengeId)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              readOnly 
              value={window.location.origin + verifyUrl}
              className="font-mono text-xs bg-background/30"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(window.location.origin + verifyUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center mt-4">
            <Button 
              size="lg" 
              asChild
              className="gap-2"
            >
              <Link href={verifyUrl}>
                Go to Verification Page <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}