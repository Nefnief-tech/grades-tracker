'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Client, Account } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, MailCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get userId and secret from URL params
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
          setStatus('error');
          setMessage('Invalid verification link. Missing required parameters.');
          return;
        }

        // Initialize Appwrite client
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
        
        const account = new Account(client);

        // Complete verification
        await account.updateVerification(userId, secret);
        
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now enjoy all features of GradeTracker.');
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            GradeTracker Account Verification
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <p className="text-center text-muted-foreground">{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {status === 'success' && (
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2 w-full">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push('/verify-email/resend')}
              >
                <MailCheck className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Button>
              
              <Button className="w-full" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          )}
          
          {status === 'loading' && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Need help? <Link href="/help" className="text-primary hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}