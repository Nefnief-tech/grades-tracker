'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Client, Account } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordConfirmPage() {
  // No router needed, using direct navigation
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get userId and secret from URL parameters
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters
    return password.length >= 8;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate userId and secret
    if (!userId || !secret) {
      setStatus('error');
      setMessage('Invalid reset link. Missing required parameters.');
      return;
    }
    
    // Validate password
    if (!validatePassword(password)) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }
    
    // Confirm passwords match
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    
    setStatus('loading');
    setMessage('Updating your password...');

    try {
      // Initialize Appwrite client
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
      const account = new Account(client);
      
      // Complete password recovery
      await account.updateRecovery(userId, secret, password, password);
      
      setStatus('success');
      setMessage('Your password has been successfully reset! You can now log in with your new password.');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setStatus('error');
      
      // Handle specific error cases
      if (error.code === 401) {
        setMessage('Invalid or expired reset link. Please request a new password reset.');
      } else {
        setMessage(error.message || 'Failed to reset your password. Please try again later.');
      }
    }
  };

  // Check if link is valid
  const isValidLink = userId && secret;
  return (
    <div className="w-full max-w-md px-4">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Create a new secure password for your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isValidLink && status === 'idle' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Link</AlertTitle>
              <AlertDescription>
                This password reset link appears to be invalid or missing required information.
                Please request a new password reset.
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'success' ? (
            <div className="flex flex-col items-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
            </div>
          ) : status === 'error' ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {isValidLink && status !== 'success' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === 'loading'}
                    className="pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your password must be at least 8 characters long.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={status === 'loading'}
                  placeholder="••••••••"
                  required
                />
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {status === 'success' ? (            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          ) : isValidLink ? (
            <Button 
              className="w-full flex items-center justify-center"
              onClick={handleResetPassword}
              disabled={status === 'loading' || !password || !confirmPassword}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          ) : (            <Button 
              className="w-full"
              onClick={() => window.location.href = '/reset-password'}
            >
              Request New Reset Link
            </Button>
          )}
            <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/login'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Remember your password? <Link href="/login" className="text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}