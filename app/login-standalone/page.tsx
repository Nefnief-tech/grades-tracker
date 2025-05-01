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
import { AlertCircle, Loader2, Mail, Shield } from "lucide-react";
import { 
  login as appwriteLogin, 
  getCurrentUser 
} from '@/lib/appwrite';
import appwriteMFA from '@/lib/appwrite-mfa';
import { AppwriteException } from 'appwrite';
import { useAuth } from "@/contexts/AuthContext";

export default function StandaloneLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { updateUserState } = useAuth();

  // Helper to check if an error is MFA related
  function isMfaRequiredError(error: any): boolean {
    if (!error) return false;
    
    return (
      (error.type === 'user_mfa_challenge') ||
      (error.type === 'user_more_factors_required') ||
      (typeof error.message === 'string' && error.message.includes('More factors are required')) ||
      (error.code === 412)
    );
  }

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
      await appwriteLogin(email, password);
      
      try {
        // Try to get user data
        const user = await getCurrentUser();
        
        if (user) {
          // Login succeeded without MFA
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          // Update auth context with user data
          updateUserState(user);
          
          // Redirect to dashboard
          router.push("/dashboard");
          return;
        }
        
        throw new Error("Failed to get user data after login");
      } catch (userError: any) {
        console.error("Error getting user data:", userError);
        
        // Check if this is an MFA challenge
        if (isMfaRequiredError(userError)) {
          try {
            // Create an email challenge for verification
            const challenge = await appwriteMFA.createEmailChallenge();
            
            if (challenge && challenge.$id) {
              setChallengeId(challenge.$id);
              setIsMfaRequired(true);
              setIsLoading(false);
              return;
            }
            
            throw new Error("Failed to create MFA challenge");
          } catch (challengeError) {
            console.error("Error creating MFA challenge:", challengeError);
            setError("Failed to initialize two-factor authentication");
          }
        } else {
          // Not an MFA error
          throw userError;
        }
      }
    } catch (loginError: any) {
      console.error("Login error:", loginError);
      
      // Check if the login error itself is MFA related
      if (isMfaRequiredError(loginError)) {
        try {
          // Create an email challenge for verification
          const challenge = await appwriteMFA.createEmailChallenge();
          
          if (challenge && challenge.$id) {
            setChallengeId(challenge.$id);
            setIsMfaRequired(true);
            setIsLoading(false);
            return;
          }
        } catch (challengeError) {
          console.error("Error creating MFA challenge:", challengeError);
        }
      }
      
      // Format error message for user
      if (loginError instanceof AppwriteException) {
        if (loginError.code === 401) {
          setError("Invalid email or password");
        } else {
          setError(loginError.message);
        }
      } else if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length < 6) {
      setError("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Verify the challenge
      await appwriteMFA.verifyChallenge(challengeId, verificationCode);
      
      try {
        // Get user data after verification
        const user = await getCurrentUser();
        
        if (user) {
          // Update auth context
          updateUserState(user);
          
          toast({
            title: "Login successful",
            description: "Two-factor authentication complete",
          });
          
          router.push("/dashboard");
          return;
        }
        
        throw new Error("Failed to get user data after verification");
      } catch (userError) {
        console.error("Error getting user after verification:", userError);
        setError("Failed to complete login after verification");
      }
    } catch (verifyError: any) {
      console.error("Verification error:", verifyError);
      
      let errorMessage = "Invalid verification code";
      if (verifyError instanceof AppwriteException) {
        errorMessage = verifyError.message;
      } else if (verifyError instanceof Error) {
        errorMessage = verifyError.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const challenge = await appwriteMFA.createEmailChallenge();
      
      if (challenge && challenge.$id) {
        setChallengeId(challenge.$id);
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email",
        });
      } else {
        setError("Failed to send new verification code");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setError("Failed to send new verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseRecoveryCode = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const challenge = await appwriteMFA.createRecoveryChallenge();
      
      if (challenge && challenge.$id) {
        setChallengeId(challenge.$id);
        toast({
          title: "Recovery Mode",
          description: "Please enter one of your recovery codes",
        });
      } else {
        setError("Failed to initialize recovery code verification");
      }
    } catch (error) {
      console.error("Error setting up recovery code:", error);
      setError("Failed to initialize recovery code verification");
    } finally {
      setIsLoading(false);
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
        <div className="w-full max-w-md">
          <Card className="border-border">
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
                
                <div className="flex flex-col space-y-2 mt-2">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-normal justify-start"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    type="button"
                  >
                    Didn't receive a code? Send a new one
                  </Button>
                  
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-normal justify-start"
                    onClick={handleUseRecoveryCode}
                    disabled={isLoading}
                    type="button"
                  >
                    Lost access to your email? Use a recovery code
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2 justify-end">
              <Button 
                variant="ghost" 
                onClick={handleCancelMfa} 
                disabled={isLoading}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={isLoading || verificationCode.length < 6}
                type="button"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Show normal login form
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border-border">
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