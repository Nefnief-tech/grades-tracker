"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { AlertCircle, Loader2, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { handleMfaLogin, verifyMfaChallenge } from '@/lib/mfa-login';

export default function LoginPage() {
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // MFA verification state
  const [showMfaVerify, setShowMfaVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { toast } = useToast();
  const { updateUserState } = useAuth();
  
  // Handle initial login
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
      // Import the MFA handler dynamically
      const { handleMfaLogin } = await import('@/lib/mfa-handler');
      
      // Use the MFA handler to attempt login
      const result = await handleMfaLogin(email, password);
      
      // Check if login was successful
      if (result.success && result.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        window.location.href = "/";
        return;
      }
      
      // Check if MFA is required
      if (result.requiresMFA && result.mfaChallenge) {
        // Redirect to the MFA verification page
        window.location.href = `/direct-mfa-login?email=${encodeURIComponent(email)}&challengeId=${result.mfaChallenge.challengeId}`;
        return;
      }
      
      // Handle other errors
      toast({
        title: "Login failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your grades
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/reset-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
              <div className="text-center text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/"}
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