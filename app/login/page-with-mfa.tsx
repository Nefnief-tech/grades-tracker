"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MFALoginChallenge } from "@/components/MFALoginChallenge";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // State for MFA challenge
  const [mfaChallenge, setMfaChallenge] = useState<null | { 
    userId: string; 
    email: string; 
    challengeId: string 
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const loginResult = await login(email, password);
      
      // If result is successful, redirect
      if (loginResult && loginResult.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        router.push("/dashboard");
        return;
      }
      
      // If MFA is required, show the challenge UI
      if (loginResult && loginResult.requiresMFA && loginResult.mfaChallenge) {
        console.log('MFA required, showing challenge UI');
        setMfaChallenge(loginResult.mfaChallenge);
        return;
      }
      
      // If we get here, something unexpected happened
      setError("Login failed. Please try again.");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Special handling for MFA errors
      if (error.message && error.message.includes('More factors are required')) {
        try {
          // Import appwriteMFA to create a challenge
          const appwriteMFA = (await import('@/lib/appwrite-mfa')).default;
          const challenge = await appwriteMFA.createEmailChallenge();
          
          if (challenge && challenge.$id) {
            setMfaChallenge({
              userId: '',  // We don't have userId at this point
              email: email,
              challengeId: challenge.$id
            });
            return;
          }
        } catch (mfaError) {
          setError('Failed to initialize two-factor authentication');
        }
      } else {
        // Regular login error
        setError(error.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle MFA verification completion
  const handleMfaVerify = async (userId: string) => {
    setIsLoading(true);
    try {
      // Import the MFA completion function
      const { completeMfaVerification } = await import('@/lib/enhanced-auth');
      
      // Complete MFA verification
      await completeMfaVerification(userId, 
        (user) => {}, // These callbacks are handled in AuthContext
        (isAdmin) => {}, 
        (isAdmin) => {}
      );
      
      // Redirect after successful verification
      toast({
        title: "Login successful",
        description: "Two-factor authentication complete",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("MFA verification error:", error);
      setError('Failed to complete verification');
      toast({
        title: "Verification failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle MFA cancellation
  const handleCancelMfa = () => {
    setMfaChallenge(null);
    setError('');
  };
  
  // If we have an MFA challenge, show the MFA verification UI
  if (mfaChallenge) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <MFALoginChallenge 
          email={mfaChallenge.email}
          userId={mfaChallenge.userId || ''}
          challengeId={mfaChallenge.challengeId}
          onVerify={handleMfaVerify}
          onCancel={handleCancelMfa}
        />
      </div>
    );
  }

  // Otherwise show the normal login form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
              
              <div className="text-center text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  type="button"
                >
                  Continue without logging in
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}