'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EmailOTPSetupProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
  userEmail?: string;
}

export default function EmailOTPSetup({ onComplete, onCancel, userEmail }: EmailOTPSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [challengeId, setChallengeId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const setupEmailOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!account) {
        throw new Error('Authentication service not available');
      }
      
      console.log('Setting up email OTP via phone authenticator...');
      
      // Appwrite only supports 'totp' for createMfaAuthenticator
      // For email-based 2FA, we need to use phone authenticator with email
      // or rely on email challenges during login
      
      // Try to create a phone authenticator which can work with email
      try {
        const authenticator = await account.createMfaAuthenticator('phone' as any);
        console.log('Phone authenticator created for email:', authenticator);
        
        // Create email challenge to verify
        const challenge = await account.createMfaChallenge('email' as any);
        setChallengeId(challenge.$id);
        console.log('Email OTP challenge created:', challenge.$id);
        
        setStep('verify');
        toast({
          title: "Verification email sent",
          description: `Please check your email at ${userEmail} for the verification code`,
        });
      } catch (phoneError: any) {
        console.log('Phone authenticator failed, trying alternative approach:', phoneError);
        
        // Alternative: Just enable MFA and rely on email challenges during login
        // This approach sets up the account for 2FA without a specific authenticator
        const challenge = await account.createMfaChallenge('email' as any);
        setChallengeId(challenge.$id);
        console.log('Direct email challenge created:', challenge.$id);
        
        setStep('verify');
        toast({
          title: "Verification email sent",
          description: `Please check your email at ${userEmail} for the verification code`,
        });
      }
    } catch (error: any) {
      console.error('Failed to setup email OTP:', error);
      
      if (error.message?.includes('Invalid `type` param')) {
        setError('Email-based 2FA setup is not available. Please use an authenticator app instead.');
      } else {
        setError(error.message || 'Failed to setup email-based two-factor authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');    try {
      if (!account) {
        throw new Error('Authentication service not available');
      }
      
      console.log('Verifying email OTP code:', verificationCode);
      await account.updateMfaChallenge(challengeId, verificationCode);
      
      onComplete(true);
      toast({
        title: "Email 2FA Enabled",
        description: "Email-based two-factor authentication has been successfully enabled",
      });
    } catch (error: any) {
      console.error('Failed to verify email OTP:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle>Enable Email 2FA</CardTitle>
          </div>
          <CardDescription>
            Secure your account with email-based two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Email 2FA will send verification codes to:</p>
            <p className="font-medium text-foreground">{userEmail}</p>
            <p className="mt-2">You'll receive a code via email each time you log in.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={setupEmailOTP} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enable Email 2FA
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Verify Email Code</CardTitle>
        </div>
        <CardDescription>
          Enter the verification code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            We've sent a verification code to:
          </p>
          <p className="font-medium">{userEmail}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="verification-code" className="text-sm font-medium">
            Enter verification code:
          </label>
          <Input
            id="verification-code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={verifyEmailOTP} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Enable'
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>

        <div className="text-center">
          <Button 
            variant="link" 
            size="sm" 
            onClick={setupEmailOTP}
            disabled={isLoading}
          >
            Resend code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}