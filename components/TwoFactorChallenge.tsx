'use client';

import React, { useState } from 'react';
import { account } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail, ArrowLeft } from 'lucide-react';

interface TwoFactorChallengeProps {
  challengeId: string;
  onSuccess: () => void;
  onBack: () => void;
  userEmail: string;
}

export function TwoFactorChallenge({ challengeId, onSuccess, onBack, userEmail }: TwoFactorChallengeProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { complete2FAChallenge } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      await complete2FAChallenge(challengeId, code);
      // Success - redirect will be handled by AuthContext
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  const handleResendCode = async () => {
    try {
      setIsVerifying(true);
      setError('');
      if (account) {
        await account.createMfaChallenge('email' as any);
      }
    } catch (error: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the verification code sent to your email
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="font-medium">{userEmail}</span>
          </div>
        </CardHeader>        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verification-code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Verification Code
              </label>
              <Input
                id="verification-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                disabled={isVerifying}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isVerifying || code.length !== 6}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isVerifying}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Code
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isVerifying}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}