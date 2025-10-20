'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const userId = searchParams?.get('userId');
    const secret = searchParams?.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        if (!account) {
          throw new Error('Account service not available');
        }
        await account.updateVerification(userId, secret);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === 'error' && <XCircle className="w-12 h-12 text-red-600" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        {status !== 'loading' && (
          <CardContent>
            <Button onClick={handleContinue} className="w-full">
              {status === 'success' ? 'Continue to Dashboard' : 'Go to Login'}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}