"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Clipboard, Copy, RefreshCcw, Share2 } from "lucide-react";

interface ChallengeDisplayProps {
  challengeId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ChallengeDisplay({ 
  challengeId: propsChallengeId, 
  onRefresh,
  isRefreshing = false 
}: ChallengeDisplayProps) {
  const [challengeId, setChallengeId] = useState<string>(propsChallengeId || "");
  const { toast } = useToast();

  useEffect(() => {
    // If props change, update state
    if (propsChallengeId) {
      setChallengeId(propsChallengeId);
    }
    // Otherwise try to get from storage
    else {
      const storedId = localStorage.getItem("mfa_challenge_id") || 
                      sessionStorage.getItem("mfa_challenge_id");
      if (storedId) {
        setChallengeId(storedId);
      }
    }
  }, [propsChallengeId]);

  const copyToClipboard = () => {
    if (!challengeId) return;
    
    navigator.clipboard.writeText(challengeId)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Challenge ID has been copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Could not copy text:", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const generateShareLink = () => {
    if (!challengeId) return "";
    
    const url = new URL("/verify-mfa", window.location.origin);
    url.searchParams.append("challengeId", challengeId);
    
    // Also try to get email from storage
    const email = localStorage.getItem("mfa_email") || 
                 sessionStorage.getItem("mfa_email");
    if (email) {
      url.searchParams.append("email", email);
    }
    
    return url.toString();
  };

  const shareLink = () => {
    const link = generateShareLink();
    if (!link) return;
    
    if (navigator.share) {
      navigator.share({
        title: "MFA Verification",
        text: "Use this link to complete MFA verification",
        url: link,
      })
      .catch((err) => {
        console.error("Error sharing:", err);
        copyLinkToClipboard();
      });
    } else {
      copyLinkToClipboard();
    }
  };

  const copyLinkToClipboard = () => {
    const link = generateShareLink();
    if (!link) return;
    
    navigator.clipboard.writeText(link)
      .then(() => {
        toast({
          title: "Link copied to clipboard",
          description: "Verification link has been copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Could not copy link:", err);
      });
  };

  const handleManualRedirect = () => {
    const link = generateShareLink();
    if (link) {
      window.location.href = link;
    }
  };

  if (!challengeId) {
    return null;
  }

  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>MFA Challenge</span>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Refreshing..." : "New Code"}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Use this challenge ID in the verification page
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="grid flex-1 gap-1">
            <label className="text-xs text-muted-foreground">
              Challenge ID
            </label>
            <Input
              readOnly
              value={challengeId}
              className="font-mono text-xl tracking-wide text-center"
            />
          </div>
          
          <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <Button className="w-full" onClick={handleManualRedirect}>
          Go to Verification Page
        </Button>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={shareLink}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Verification Link
        </Button>
      </CardFooter>
    </Card>
  );
}