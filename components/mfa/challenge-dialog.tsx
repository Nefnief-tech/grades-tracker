"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface MfaChallengeDialogProps {
  email: string;
  challengeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MfaChallengeDialog({
  email,
  challengeId,
  open,
  onOpenChange
}: MfaChallengeDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const directLink = `${window.location.origin}/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;
  
  // Ensure data is saved to storage
  useEffect(() => {
    if (open && email && challengeId) {
      try {
        // Save to session storage
        sessionStorage.setItem("mfa_email", email);
        sessionStorage.setItem("mfa_challenge_id", challengeId);
        
        // Save to local storage
        localStorage.setItem("mfa_email", email);
        localStorage.setItem("mfa_challenge_id", challengeId);
        
        // Save to cookies
        document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
        document.cookie = `mfa_challenge_id=${challengeId}; path=/; max-age=3600; SameSite=Strict`;
      } catch (error) {
        console.error("Error saving MFA data to storage:", error);
      }
    }
  }, [open, email, challengeId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(directLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied to clipboard",
          description: "You can now paste the verification link"
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Please select and copy the link manually"
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication Required</DialogTitle>
          <DialogDescription>
            A verification code has been sent to your email address. You need to complete verification to continue.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="verification-link">Verification Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="verification-link"
                defaultValue={directLink}
                readOnly
                className="font-mono text-xs"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                onClick={copyToClipboard}
                title="Copy verification link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click on this link to verify your login
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="challenge-id">Challenge ID</Label>
            <Input
              id="challenge-id"
              defaultValue={challengeId}
              readOnly
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              If the link doesn't work, you'll need this ID on the verification page
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            asChild
            variant="default" 
            className="gap-2"
          >
            <Link href={directLink}>
              Continue to Verification
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}