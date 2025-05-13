'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { appwriteMFA } from '@/lib/appwrite-mfa';
import { AppwriteException } from 'appwrite';

interface MFAVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  challengeId?: string;
  email?: string;
}

export function MFAVerification({ 
  onSuccess, 
  onCancel,
  challengeId: initialChallengeId,
  email
}: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeId, setChallengeId] = useState(initialChallengeId || '');
  const [showRecovery, setShowRecovery] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      setError('Email is required for MFA verification');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create a new email challenge
      const challenge = await appwriteMFA.createEmailChallenge();
      setChallengeId(challenge.$id);
      
      toast({
        title: 'Verification Code Sent',
        description: `Check your email for the verification code.`,
      });
    } catch (error) {
      console.error('Failed to send verification code:', error);
      if (error instanceof AppwriteException) {
        setError(error.message);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!challengeId) {
      setError('Challenge ID is missing. Please request a new code.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Complete the challenge with the entered code
      await appwriteMFA.verifyChallenge(challengeId, verificationCode);
      
      toast({
        title: 'Verification Successful',
        description: 'You have successfully completed two-factor authentication.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to dashboard or reload to update session
        router.refresh();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      if (error instanceof AppwriteException) {
        setError(error.message);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseRecoveryCode = async () => {
    setShowRecovery(true);
  };

  const handleVerifyRecovery = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Create a recovery challenge
      const challenge = await appwriteMFA.createRecoveryChallenge();
      
      // Complete the challenge with the recovery code
      await appwriteMFA.verifyChallenge(challenge.$id, verificationCode);
      
      toast({
        title: 'Recovery Successful',
        description: 'You have successfully authenticated with a recovery code.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to dashboard or reload to update session
        router.refresh();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to verify recovery code:', error);
      if (error instanceof AppwriteException) {
        setError(error.message);
      } else {
        setError('Invalid recovery code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2" />
          {showRecovery ? 'Recovery Code' : 'Two-Factor Verification'}
        </CardTitle>
        <CardDescription>
          {showRecovery 
            ? 'Enter a recovery code to access your account' 
            : 'Enter the verification code sent to your email'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {!showRecovery && !challengeId && (
          <div className="flex items-center justify-center">
            <Button 
              onClick={handleSendCode} 
              disabled={isLoading}
              className="w-full"
              variant="secondary"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Send Verification Code
            </Button>
          </div>
        )}
        
        {(showRecovery || challengeId) && (
          <div className="space-y-2">
            <Label htmlFor="code">
              {showRecovery ? 'Recovery Code' : 'Verification Code'}
            </Label>
            <Input
              id="code"
              placeholder={showRecovery ? 'Enter recovery code' : 'Enter verification code'}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center"
            />
          </div>
        )}
        
        {!showRecovery && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2 text-muted-foreground" 
            onClick={handleUseRecoveryCode}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Use Recovery Code Instead
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={showRecovery ? handleVerifyRecovery : handleVerify} 
          disabled={isLoading || !verificationCode || (!showRecovery && !challengeId)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
}