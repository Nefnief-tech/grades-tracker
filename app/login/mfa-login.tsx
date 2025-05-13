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
import { isMfaRequiredError, handleMfaChallenge } from "@/lib/mfa-auth-handler";

export default function MfaLoginPage() {
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
      // First attempt normal login
      await login(email, password);
      
      // If we get here, login succeeded without MFA
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if this is an MFA required error
      if (isMfaRequiredError(error)) {
        try {
          // Handle MFA challenge
          const challenge = await handleMfaChallenge(email);
          
          // Show MFA verification UI
          setMfaChallenge({
            userId: error.userId || '',
            email: email,
            challengeId: challenge.challengeId
          });
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
      // After successful verification, try login again
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Two-factor authentication complete",
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error after MFA verification:", error);
      setError('Failed to complete login after verification');
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
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}