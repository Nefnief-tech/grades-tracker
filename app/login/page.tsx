"use client";
import { ForgotPassword } from '@/components/ForgotPassword';
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
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorChallenge } from "@/components/TwoFactorChallenge";
import { EnhancedTwoFactorChallenge } from "@/components/EnhancedTwoFactorChallenge";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import MFADebugInfo from "@/components/MFADebugInfo";

export default function LoginPage() {  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);  const [show2FA, setShow2FA] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, requires2FA, twoFactorChallenge } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {      await login(email, password);
      // Successful login will redirect via auth context
    } catch (err: any) {
      console.log('Login error details:', err);
      
      if (err.message === "2FA_REQUIRED") {
        setShow2FA(true);
        setUserEmail(email);
      } else if (err.message === "2FA_SETUP_REQUIRED") {
        setShow2FASetup(true);
        setUserEmail(email);
      } else if (err.message?.includes('More factors are required')) {
        // Force setup if we get this error directly
        console.log('Forcing 2FA setup due to missing authenticators');
        setShow2FASetup(true);
        setUserEmail(email);
      } else {
        toast({
          title: "Login failed",
          description: err.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };  const handle2FASuccess = () => {
    setShow2FA(false);
    
    // Force redirect to dashboard after successful 2FA
    toast({
      title: "Login successful",
      description: "Redirecting to dashboard...",
    });
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  const handle2FABack = () => {
    setShow2FA(false);
    setEmail("");
    setPassword("");
  };  const handle2FASetupComplete = (success: boolean) => {
    setShow2FASetup(false);
    if (success) {
      toast({
        title: "2FA Setup Complete",
        description: "Two-factor authentication has been enabled. Logging you in...",
      });
      
      // After successful 2FA setup, automatically attempt login again
      // This time it should trigger the 2FA challenge flow
      setTimeout(async () => {
        try {
          setIsLoading(true);
          await login(email, password);
          // If this succeeds completely, user will be redirected by AuthContext
        } catch (err: any) {
          console.log('Post-2FA setup login:', err);
          
          // If we get 2FA_REQUIRED, that's expected - show the challenge
          if (err.message === "2FA_REQUIRED") {
            setShow2FA(true);
            setUserEmail(email);
          } else {
            // For other errors, show normal error handling
            toast({
              title: "Login failed",
              description: "Please try logging in again with your new 2FA setup.",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Small delay to let the user see the success message
    }
  };

  const handle2FASetupCancel = () => {
    setShow2FASetup(false);
    setEmail("");
    setPassword("");
  };  // Show 2FA challenge if required
  if ((show2FA || requires2FA) && twoFactorChallenge) {
    return (
      <EnhancedTwoFactorChallenge
        challengeId={twoFactorChallenge}
        onSuccess={handle2FASuccess}
        onBack={handle2FABack}
        userEmail={userEmail || email}
      />
    );
  }

  // Show 2FA setup if required
  if (show2FASetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">        <div className="w-full max-w-md px-4">
          <TwoFactorSetup 
            onComplete={handle2FASetupComplete}
            onCancel={handle2FASetupCancel}
            userEmail={userEmail || email}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        {!showForgotPassword ? (
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
                    onClick={() => router.push("/")}
                    type="button"
                  >
                    Continue without logging in
                  </Button>
                </div>                <div className="text-center text-sm">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowForgotPassword(true)}
                    type="button"
                  >
                    Forgot your password?
                  </Button>
                </div>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-center text-sm">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                      type="button"
                    >
                      {showDebug ? 'Hide' : 'Show'} MFA Debug
                    </Button>
                  </div>
                )}
              </CardFooter>
            </form>
          </Card>        ) : (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        )}
        
        {showDebug && process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <MFADebugInfo />
          </div>
        )}
      </div>
    </div>
  );
}
