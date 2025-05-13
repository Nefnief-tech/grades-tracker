"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { verifyMfaChallenge } from "@/lib/mfa-handler";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMfaChallengeId } from "@/lib/mfa-utils";
import { MfaInfoDrawer } from "@/components/mfa/mfa-info-drawer";

export default function VerifyMfaPage() {  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [challengeId, setChallengeId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Get challenge ID and email from all possible sources
  useEffect(() => {
    // Log what we're doing
    console.log('[Verify MFA] Looking for challenge ID and email from all sources...');
    
    // Log all query parameters for debugging
    const debugInfo = {};
    searchParams.forEach((value, key) => {
      debugInfo[key] = value;
    });
    console.log('[Verify MFA] Search params object:', debugInfo);
    console.log('[Verify MFA] URL search string:', window.location.search);
    
    // Function to get value from cookie
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };
    
    // Sources in priority order
    // 1. URL parameters (highest priority)
    const urlChallengeId = searchParams.get("challengeId");
    const urlEmail = searchParams.get("email");
    
    console.log("[Verify MFA] URL Challenge ID:", urlChallengeId);
    console.log("[Verify MFA] URL Email:", urlEmail);
    
    // 2. Local Storage
    const lsChallengeId = typeof window !== 'undefined' ? localStorage.getItem("mfa_challenge_id") : null;
    const lsEmail = typeof window !== 'undefined' ? localStorage.getItem("mfa_email") : null;
    
    console.log("[Verify MFA] LocalStorage Challenge ID:", lsChallengeId);
    console.log("[Verify MFA] LocalStorage Email:", lsEmail);
    
    // 3. Session Storage
    const ssChallengeId = typeof window !== 'undefined' ? sessionStorage.getItem("mfa_challenge_id") : null;
    const ssEmail = typeof window !== 'undefined' ? sessionStorage.getItem("mfa_email") : null;
    
    console.log("[Verify MFA] SessionStorage Challenge ID:", ssChallengeId);
    console.log("[Verify MFA] SessionStorage Email:", ssEmail);
    
    // 4. Cookies
    const cookieChallengeId = typeof window !== 'undefined' ? getCookie("mfa_challenge_id") : null;
    const cookieEmail = typeof window !== 'undefined' ? getCookie("mfa_email") : null;
    
    console.log("[Verify MFA] Cookie Challenge ID:", cookieChallengeId);
    console.log("[Verify MFA] Cookie Email:", cookieEmail);
    
    // 5. Global variables
    const globalChallengeId = typeof window !== 'undefined' ? (window as any).__MFA_CHALLENGE_ID__ : null;
    const globalEmail = typeof window !== 'undefined' ? (window as any).__MFA_EMAIL__ : null;
    
    console.log("[Verify MFA] Global Challenge ID:", globalChallengeId);
    console.log("[Verify MFA] Global Email:", globalEmail);
    
    // Use the first available value for challenge ID
    const finalChallengeId = urlChallengeId || lsChallengeId || ssChallengeId || cookieChallengeId || globalChallengeId || "";
    const finalEmail = urlEmail || lsEmail || ssEmail || cookieEmail || globalEmail || "";
    
    console.log("[Verify MFA] Final Challenge ID:", finalChallengeId);
    console.log("[Verify MFA] Final Email:", finalEmail);
    
    // Update state with found values - even if challengeId is empty to trigger auto-create
    setChallengeId(finalChallengeId);
    if (finalEmail) {
      setEmail(finalEmail);
    }
    
    // If we have the challenge ID, store it everywhere for consistency
    if (finalChallengeId && typeof window !== 'undefined') {
      try {
        // Update all storage locations
        localStorage.setItem("mfa_challenge_id", finalChallengeId);
        sessionStorage.setItem("mfa_challenge_id", finalChallengeId);
        document.cookie = `mfa_challenge_id=${finalChallengeId}; path=/; max-age=3600; SameSite=Strict`;
        (window as any).__MFA_CHALLENGE_ID__ = finalChallengeId;
        
        if (finalEmail) {
          localStorage.setItem("mfa_email", finalEmail);
          sessionStorage.setItem("mfa_email", finalEmail);
          document.cookie = `mfa_email=${finalEmail}; path=/; max-age=3600; SameSite=Strict`;
          (window as any).__MFA_EMAIL__ = finalEmail;
        }
      } catch (e) {
        console.error("[Verify MFA] Error storing challenge data:", e);
      }
    }
    
    // If we still don't have a challenge ID, automatically create a new one
    if (!finalChallengeId) {
      console.warn("[Verify MFA] No challenge ID found, creating a new challenge");
        const createNewChallenge = async () => {
        try {
          // Import the API client
          const { createMfaChallengeWithStorage } = await import('@/lib/mfa-challenge-api');
          
          // Create a new challenge via API
          const result = await createMfaChallengeWithStorage(finalEmail);
          
          if (result.success && result.challengeId) {
            console.log("[Verify MFA] Created new challenge via API:", result);
            
            // Set the new challenge ID
            setChallengeId(result.challengeId);
            
            toast({
              title: "Verification Code Sent",
              description: "A new verification code has been sent to your email",
            });
          } else {
            throw new Error(result.error || "Failed to create challenge");
          }
        } catch (error) {
          console.error("[Verify MFA] Error creating challenge:", error);
          toast({
            title: "Error",
            description: "Failed to create verification challenge",
            variant: "destructive",
          });
          
          // Fallback to direct creation
          try {
            const appwriteMFA = (await import('@/lib/appwrite-mfa')).default;
            const challenge = await appwriteMFA.createEmailChallenge();
            console.log("[Verify MFA] Created new challenge with fallback:", challenge);
            
            // Set the new challenge ID
            setChallengeId(challenge.$id);
            
            // Store it
            if (typeof window !== 'undefined') {
              localStorage.setItem("mfa_challenge_id", challenge.$id);
              sessionStorage.setItem("mfa_challenge_id", challenge.$id);
              document.cookie = `mfa_challenge_id=${challenge.$id}; path=/; max-age=3600; SameSite=Strict`;
              (window as any).__MFA_CHALLENGE_ID__ = challenge.$id;
            }
            
            toast({
              title: "Verification Code Sent",
              description: "A new verification code has been sent to your email (fallback method)",
            });
          } catch (fallbackError) {
            console.error("[Verify MFA] Fallback creation also failed:", fallbackError);
          }
        }
      };
      
      // Create the challenge automatically
      createNewChallenge();
    }
  }, [searchParams, toast]);
  
  // Set up countdown for code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
    const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeId) {
      toast({
        title: "Error",
        description: "Challenge ID is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!code || code.length < 6) {
      toast({
        title: "Error",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // First try the API endpoint method
      const { verifyMfaChallenge: verifyViaApi } = await import('@/lib/mfa-challenge-api');
      
      // Try API verification first
      const apiResult = await verifyViaApi(challengeId, code);
      console.log("[Verify MFA] API verification result:", apiResult);
      
      if (apiResult.success) {
        handleSuccessfulVerification();
        return;
      }
      
      // If API verification fails, try direct method
      console.log("[Verify MFA] API verification failed, trying direct method");
      const { verifyMfaChallenge } = await import('@/lib/mfa-handler');
      const directResult = await verifyMfaChallenge(challengeId, code);
      
      if (directResult.success) {
        handleSuccessfulVerification();
      } else {
        toast({
          title: "Verification Failed",
          description: directResult.error || apiResult.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("[Verify MFA] Verification error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Helper function for successful verification
  const handleSuccessfulVerification = () => {
    // Clean up storage
    if (typeof window !== 'undefined') {
      // Remove from all storage locations
      localStorage.removeItem("mfa_challenge_id");
      localStorage.removeItem("mfa_email");
      sessionStorage.removeItem("mfa_challenge_id");
      sessionStorage.removeItem("mfa_email");
      document.cookie = "mfa_required=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "mfa_challenge_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "mfa_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      delete (window as any).__MFA_CHALLENGE_ID__;
      delete (window as any).__MFA_EMAIL__;
    }
    
    // Show success toast
    toast({
      title: "Verification Successful",
      description: "You have been successfully verified",
      variant: "default",
    });
    
    // Redirect to dashboard or return URL
    const returnTo = searchParams.get("returnTo") || "/dashboard";
    
    // Use hard redirect to ensure full page load
    window.location.href = returnTo;
  };
    const resendCode = async () => {
    try {
      // First try the API endpoint
      const { createMfaChallengeWithStorage } = await import('@/lib/mfa-challenge-api');
      const result = await createMfaChallengeWithStorage(email);
      
      if (result.success && result.challengeId) {
        // Update the challenge ID
        setChallengeId(result.challengeId);
        
        // Show success message
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email",
        });
        
        // Start countdown
        setCountdown(60);
        return;
      }
      
      // If API fails, fall back to direct method
      console.log("[Verify MFA] API resend failed, trying direct method");
      const appwriteMFA = (await import('@/lib/appwrite-mfa')).default;
      
      // Create a new challenge
      const challenge = await appwriteMFA.createEmailChallenge();
      
      // Update the challenge ID
      setChallengeId(challenge.$id);
      
      // Update storage in all locations
      if (typeof window !== 'undefined') {
        localStorage.setItem("mfa_challenge_id", challenge.$id);
        sessionStorage.setItem("mfa_challenge_id", challenge.$id);
        document.cookie = `mfa_challenge_id=${challenge.$id}; path=/; max-age=3600; SameSite=Strict`;
        (window as any).__MFA_CHALLENGE_ID__ = challenge.$id;
        
        // Store email if available
        if (email) {
          localStorage.setItem("mfa_email", email);
          sessionStorage.setItem("mfa_email", email);
          document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
          (window as any).__MFA_EMAIL__ = email;
        }
      }
      
      // Show success message
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email (fallback method)",
      });
      
      // Start countdown
      setCountdown(60);
    } catch (error: any) {
      console.error("[Verify MFA] Error resending code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend code",
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = () => {
    if (!challengeId) return;
    
    navigator.clipboard.writeText(challengeId)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Challenge ID has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please select and copy the challenge ID manually",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Display the Challenge ID prominently */}
            {challengeId ? (
              <div className="mb-6">
                <div className="bg-muted p-3 rounded-lg border mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Challenge ID:</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="font-mono text-base sm:text-lg tracking-wide bg-background p-2 rounded border text-center">
                    {challengeId}
                  </p>
                </div>
              </div>
            ) : (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No challenge ID found. Please enter it manually or wait for a new code to be sent.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleVerify} className="space-y-4">
              {!challengeId && (
                <div className="space-y-2">
                  <Label htmlFor="challengeId">Challenge ID</Label>
                  <Input
                    id="challengeId"
                    placeholder="Enter the challenge ID"
                    value={challengeId}
                    onChange={(e) => setChallengeId(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter the 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  className="text-center text-xl tracking-widest"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || !challengeId || code.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : "Verify & Continue"}
              </Button>
            </form>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                <Info className="h-4 w-4 mr-2" />
                {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
              </Button>
              
              {showDebugInfo && (
                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded border overflow-auto max-h-32">
                  <div>URL parameters: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</div>
                  <div>Challenge ID: {challengeId}</div>
                  <div>Email: {email}</div>
                  <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                </div>
              )}
            </div>
          </CardContent>
            <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground text-center">
              {"Didn't receive a code? "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                disabled={countdown > 0 || isVerifying}
                onClick={resendCode}
              >
                Resend code {countdown > 0 && `(${countdown}s)`}
              </Button>
            </div>
            
            {/* Help drawer with information about verification */}
            <MfaInfoDrawer challengeId={challengeId} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}