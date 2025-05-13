'use client';

import React, { useState } from 'react';
// No router import needed
import { Client, Account } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  // No router needed, using direct navigation
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    
    setStatus('loading');
    setMessage('Processing your request...');

    try {
      // Initialize Appwrite client
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
      const account = new Account(client);
      
      // Create password recovery
      const resetUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/reset-password/confirm` 
        : 'https://gradetracker.app/reset-password/confirm';
        
      await account.createRecovery(email, resetUrl);
      
      setStatus('success');
      setMessage(`A password reset link has been sent to ${email}. Please check your inbox and follow the instructions.`);
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      setStatus('error');
      
      // Handle specific error cases
      if (error.code === 404) {
        setMessage('No account found with this email address.');
      } else {
        setMessage(error.message || 'Failed to process your request. Please try again later.');
      }
    }
  };
  return (
    <div className="w-full max-w-md px-4">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Email Sent!</AlertTitle>
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

          {status !== 'success' && (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  We'll send a password reset link to this email address if it's associated with an account.
                </p>
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {status === 'success' ? (            <Button className="w-full" onClick={() => window.location.href = '/login'}>
              Return to Login
            </Button>
          ) : (
            <Button 
              className="w-full flex items-center justify-center"
              onClick={handleResetRequest}
              disabled={status === 'loading' || !email}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
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