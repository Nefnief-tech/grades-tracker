"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, Loader2, Mail, Shield } from "lucide-react";
import { login as appwriteLogin, getCurrentUser } from '@/lib/appwrite';
import appwriteMFA from '@/lib/appwrite-mfa';

export default function MfaLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const { toast } = useToast();
  const router = useRouter();

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
      // First attempt to login
      await appwriteLogin(email, password);
      
      // If no error was thrown, try to get user data
      try {
        const user = await getCurrentUser();
        
        if (user) {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          router.push("/dashboard");
        }
      } catch (error: any) {
        // Check if this is an MFA challenge error
        if (
          error.type === 'user_mfa_challenge' ||
          error.type === 'user_more_factors_required' ||
          error.message?.includes('More factors are required')
        ) {
          console.log('MFA challenge required');
          
          // Create email challenge
          try {
            const challenge = await appwriteMFA.createEmailChallenge();
            if (challenge && challenge.$id) {
              setChallengeId(challenge.$id);
              setIsMfaRequired(true);
            } else {
              throw new Error("Failed to create MFA challenge");
            }
          } catch (challengeError) {
            console.error('Challenge creation error:', challengeError);
            setError('Failed to initialize two-factor authentication');
          }
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (verificationCode.length < 6) {
      setError('Please enter a valid verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Verify the challenge
      await appwriteMFA.verifyChallenge(challengeId, verificationCode);
      
      // After successful verification, try to get the user data
      const user = await getCurrentUser();
      
      if (user) {
        toast({
          title: "Login successful",
          description: "Two-factor authentication complete",
        });
        router.push("/dashboard");
      } else {
        throw new Error('Failed to get user data after verification');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRecoveryCode = async () => {
    try {
      // Create a recovery code challenge
      const challenge = await appwriteMFA.createRecoveryChallenge();
      
      if (challenge && challenge.$id) {
        setChallengeId(challenge.$id);
        toast({
          title: 'Recovery Mode',
          description: 'Please enter one of your recovery codes'
        });
      }
    } catch (error) {
      console.error('Error creating recovery challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to use recovery codes',
        variant: 'destructive'
      });
    }
  };
  
  const handleCancelMfa = () => {
    setIsMfaRequired(false);
    setChallengeId("");
    setVerificationCode("");
    setError("");
  };

  // Show MFA verification UI if needed
  if (isMfaRequired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Verify your identity to complete login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30 flex items-start">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  A verification code has been sent to your email address: <strong>{email}</strong>
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Enter the code below to complete login.
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-xl tracking-wide"
                maxLength={6}
                autoFocus
              />
              
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-blue-600 dark:text-blue-400 font-normal"
                onClick={handleRecoveryCode}
              >
                Lost access to your email? Use a recovery code
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex space-x-2 justify-end">
            <Button variant="ghost" onClick={handleCancelMfa} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={isLoading || verificationCode.length < 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Otherwise show login form
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