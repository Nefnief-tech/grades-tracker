'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Account } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    
    setStatus('loading');
    setMessage('Sending verification email...');

    try {
      // Initialize Appwrite client
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
      const account = new Account(client);
      
      // Try to log in first (required by Appwrite to send verification)
      try {
        // We're just checking if the user exists, we don't need to store the session
        await account.createEmailSession(email, 'dummy-password');
      } catch (loginError) {
        // Ignore login errors - we just need to know the email exists
      }
      
      // Create verification
      const verificationRedirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/verify-email` 
        : 'https://gradetracker.app/verify-email';
        
      await account.createVerification(verificationRedirectUrl);
      
      setStatus('success');
      setMessage(`A verification email has been sent to ${email}. Please check your inbox.`);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      setStatus('error');
      
      if (error.code === 404) {
        setMessage('No account found with this email address.');
      } else {
        setMessage(error.message || 'Failed to send verification email. Please try again later.');
      }
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Resend Verification</CardTitle>
          <CardDescription>
            We'll send you a new verification email
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
            <form onSubmit={handleResend} className="space-y-4">
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
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {status === 'success' ? (
            <Button className="w-full" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          ) : (
            <Button 
              className="w-full flex items-center justify-center"
              onClick={handleResend}
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
                  Send Verification Email
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Already verified? <Link href="/login" className="text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}