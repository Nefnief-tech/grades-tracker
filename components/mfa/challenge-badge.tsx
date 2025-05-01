"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getMfaChallengeId } from "@/lib/mfa-utils";

/**
 * Component that shows the current challenge ID prominently 
 * and allows copying it to clipboard
 */
export function ChallengeBadge() {
  const [challengeId, setChallengeId] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try to get challenge ID from URL query params first
      const params = new URLSearchParams(window.location.search);
      const urlChallengeId = params.get("challengeId");
      
      if (urlChallengeId) {
        setChallengeId(urlChallengeId);
        return;
      }
      
      // Then try stored challenge ID from anywhere
      const storedChallengeId = 
        localStorage.getItem("mfa_challenge_id") || 
        sessionStorage.getItem("mfa_challenge_id");
      
      if (storedChallengeId) {
        setChallengeId(storedChallengeId);
      }
      
      // If we still don't have it, try to read from the global variable
      if (!urlChallengeId && !storedChallengeId) {
        const globalChallengeId = (window as any).__MFA_CHALLENGE_ID__;
        if (globalChallengeId) {
          setChallengeId(globalChallengeId);
        }
      }
    }
  }, []);
  
  // Keep polling for challenge ID if we don't have one yet
  useEffect(() => {
    if (!challengeId && typeof window !== 'undefined') {
      // Poll for updates
      const intervalId = setInterval(() => {
        // Use our utility function to try all sources
        const id = getMfaChallengeId();
        if (id) {
          setChallengeId(id);
          clearInterval(intervalId);
        }
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [challengeId]);
  
  const copyToClipboard = () => {
    if (!challengeId) return;
    
    navigator.clipboard.writeText(challengeId)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Challenge ID has been copied to clipboard"
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard. Please select and copy manually.",
          variant: "destructive"
        });
      });
  };
  
  if (!challengeId) return null;
  
  return (
    <div className="bg-muted border p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-muted-foreground">Challenge ID:</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2"
          onClick={copyToClipboard}
        >
          <Copy className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Copy</span>
        </Button>
      </div>
      
      <div className="font-mono text-base sm:text-lg tracking-wide bg-background p-2 rounded border text-center">
        {challengeId}
      </div>
    </div>
  );
}