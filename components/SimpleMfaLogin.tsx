'use client';

import React, { useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';

export default function SimpleMfaLogin() {
  // Login info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // MFA info
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { updateUserState } = useAuth();
  
  // Step 1: Handle initial login
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
        
        // Update user state
        updateUserState(user);
        router.push('/dashboard');
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
  
  // Step 2: Handle verification code submission
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
        description: 'You have been logged in successfully'
      });
      
      // Update user state
      updateUserState(user);
      router.push('/dashboard');
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
  
  // Handle verification code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVerificationCode(value);
    
    // Auto-submit if 6 digits entered
    if (value.length === 6) {
      setTimeout(() => handleVerify(), 500);
    }
  };
  
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
  
  // Handle going back to login
  const handleBackToLogin = () => {
    setShowMfaChallenge(false);
    setVerificationCode('');
    setChallengeId('');
  };
  
  // Step 2: MFA Challenge UI
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
                A verification code has been sent to: <strong>{email}</strong>
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Enter the code below to complete login
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
              onChange={handleCodeChange}
              className="text-center text-xl tracking-wide"
              maxLength={6}
              autoFocus
            />
            
            <Button 
              variant="link" 
              size="sm"
              onClick={handleResendCode}
              disabled={isLoading}
              className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 font-normal"
            >
              Didn't receive a code? Send a new one
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            Back
          </Button>
          
          <Button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length < 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Step 1: Login Form UI
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login</CardTitle>
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
  );
}