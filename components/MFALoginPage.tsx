'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { AlertCircle, Loader2, Mail, Shield } from 'lucide-react';
import { login as appwriteLogin, getCurrentUser } from '@/lib/appwrite';
import appwriteMFA from '@/lib/appwrite-mfa';
import { AppwriteException } from 'appwrite';

interface MFALoginPageProps {
  onLoginSuccess?: (user: any) => void;
  redirectPath?: string;
}

export function MFALoginPage({
  onLoginSuccess,
  redirectPath = '/dashboard'
}: MFALoginPageProps) {
  // Login info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // MFA info
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  
  // Handle initial login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to login
      await appwriteLogin(email, password);
      
      try {
        // Try to get user
        const user = await getCurrentUser();
        
        // Success! No MFA needed
        toast({
          title: 'Login successful',
          description: 'Welcome back!'
        });
        
        // Call success handler if provided
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        
        // Redirect to specified path
        router.push(redirectPath);
      } catch (userError: any) {
        console.log('Login error:', userError);
        
        // Check if MFA is required
        if (userError?.message?.includes('More factors are required')) {
          // Create MFA challenge
          try {
            const challenge = await appwriteMFA.createEmailChallenge();
            setChallengeId(challenge.$id);
            setShowMfaChallenge(true);
          } catch (challengeError) {
            setError('Failed to create verification challenge');
          }
        } else {
          throw userError;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error instanceof AppwriteException) {
        if (error.code === 401) {
          setError('Invalid email or password');
        } else {
          setError(error.message);
        }
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle verification code submission
  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter your verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Verify the challenge
      await appwriteMFA.verifyChallenge(challengeId, verificationCode);
      
      // Get the user after verification
      const user = await getCurrentUser();
      
      // Success!
      toast({
        title: 'Verification successful',
        description: 'Two-factor authentication complete'
      });
      
      // Call success handler if provided
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      
      // Redirect to specified path
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Verification error:', error);
      
      if (error instanceof AppwriteException) {
        setError(error.message);
      } else {
        setError('Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-submit if code has 6 digits
  useEffect(() => {
    if (verificationCode.length === 6) {
      const timer = setTimeout(() => handleVerify(), 300);
      return () => clearTimeout(timer);
    }
  }, [verificationCode]);
  
  // Handle resending the code
  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const challenge = await appwriteMFA.createEmailChallenge();
      setChallengeId(challenge.$id);
      
      toast({
        title: 'Code sent',
        description: 'A new verification code has been sent to your email'
      });
    } catch (error: any) {
      console.error('Error sending code:', error);
      setError('Failed to send new code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle recovery code
  const handleUseRecoveryCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const challenge = await appwriteMFA.createRecoveryChallenge();
      setChallengeId(challenge.$id);
      
      toast({
        title: 'Recovery mode',
        description: 'Please enter one of your recovery codes'
      });
    } catch (error: any) {
      console.error('Error setting up recovery:', error);
      setError('Failed to initialize recovery code verification');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle going back to login
  const handleBackToLogin = () => {
    setShowMfaChallenge(false);
    setVerificationCode('');
    setChallengeId('');
  };
  
  // MFA Challenge UI
  if (showMfaChallenge) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30 flex items-start">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                A verification code has been sent to your email address.
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Enter the 6-digit code below to complete login.
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
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="text-center text-xl tracking-wide"
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />
            
            <div className="flex flex-col space-y-2 pt-2">
              <Button 
                variant="link" 
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading}
                className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 font-normal"
                type="button"
              >
                Didn't receive a code? Send a new one
              </Button>
              
              <Button 
                variant="link" 
                size="sm"
                onClick={handleUseRecoveryCode}
                disabled={isLoading}
                className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 font-normal"
                type="button"
              >
                Use a recovery code instead
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            disabled={isLoading}
            type="button"
          >
            Back
          </Button>
          
          <Button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length < 6}
            type="button"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Login Form UI
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleLogin}>
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
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
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}