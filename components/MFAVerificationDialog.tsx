'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Loader2, Mail } from 'lucide-react';
import appwriteMFA from '@/lib/appwrite-mfa';
import { RecoveryCodesDisplay } from '@/components/RecoveryCodesDisplay';

interface MFAVerificationDialogProps {
  email?: string;
  challengeId: string;
  onSuccess: () => void;
  onCancel: () => void;
  recoveryCodes: string[];
}

export function MFAVerificationDialog({
  email,
  challengeId,
  onSuccess,
  onCancel,
  recoveryCodes
}: MFAVerificationDialogProps) {
  const [verifyCode, setVerifyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(true);
  const { toast } = useToast();  const handleVerify = async () => {
    if (!challengeId || verifyCode.length < 6) return;
    
    setIsLoading(true);
    
    try {
      console.log('Verifying challenge:', challengeId, 'with code:', verifyCode);
      
      // Verify the challenge using the Appwrite MFA API
      const challengeResult = await appwriteMFA.verifyChallenge(challengeId, verifyCode);
      console.log('Challenge verification result:', challengeResult);
      
      // Enable MFA for the user
      const mfaResult = await appwriteMFA.updateMFA(true);
      console.log('MFA update result:', mfaResult);
      
      // Also store the MFA status in user preferences as a backup
      await appwriteMFA.forceMFAStatusInPreferences(true);
      
      // Check if MFA is actually enabled after all the updates
      const mfaStatus = await appwriteMFA.isMFAEnabled();
      console.log('MFA status after enabling:', mfaStatus);
      
      toast({
        title: 'Two-Factor Authentication Enabled',
        description: 'Your account is now more secure.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Invalid Code',
        description: 'The verification code is invalid or has expired.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // First show recovery codes if that option is selected
  if (showRecoveryCodes && recoveryCodes.length > 0) {
    return (
      <RecoveryCodesDisplay 
        recoveryCodes={recoveryCodes}
        onClose={() => setShowRecoveryCodes(false)}
      />
    );
  }
  
  // Then show the verification screen
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Verify your identity to enable 2FA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30 flex items-start">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              A verification code has been sent to your email address: <strong>{email}</strong>
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Enter the code below to complete setup.
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="verification-code">Enter Verification Code</Label>
          <Input
            id="verification-code"
            placeholder="123456"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="text-center text-xl tracking-wide"
            maxLength={6}
          />
            
          {/* For testing only - show the actual code */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-200 dark:border-amber-900/30 mt-2">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                Development Mode Testing:
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-300 mt-1 list-disc pl-5">
                <li>Test code: <code className="font-mono bg-amber-100 dark:bg-amber-800/40 px-1.5 py-0.5 rounded">123456</code></li>
                <li>You can also use <code className="font-mono bg-amber-100 dark:bg-amber-800/40 px-1.5 py-0.5 rounded">111111</code> as a universal test code</li>
              </ul>
            </div>
          )}
        </div>
        
        {recoveryCodes.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Your recovery codes have been generated. Make sure to save them securely.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setShowRecoveryCodes(true)}
            >
              View Recovery Codes Again
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex space-x-2 justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleVerify} disabled={isLoading || verifyCode.length < 6}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify & Enable
        </Button>
      </CardFooter>
    </Card>
  );
}