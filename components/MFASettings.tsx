'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Loader2, CheckCircle, AlertCircle, Mail, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Email2FAService } from '@/lib/email-2fa';
import appwriteMFA from '@/lib/appwrite-mfa';
import { RecoveryCodesDisplay } from '@/components/RecoveryCodesDisplay';
import { MFAVerificationDialog } from '@/components/MFAVerificationDialog';

export function MFASettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) return;
      
      try {
        // Use the Appwrite MFA API to check if MFA is enabled
        const enabled = await appwriteMFA.isMFAEnabled();
        console.log('MFA status from Appwrite:', enabled);
        setIsEnabled(enabled);
        
        // Update user object if needed
        if (user.twoFactorEnabled !== enabled) {
          updateUserState({ twoFactorEnabled: enabled });
        }
      } catch (error) {
        console.error('Error checking MFA status:', error);
        
        // Fallback to user object if API check fails
        setIsEnabled(!!user.twoFactorEnabled);
        
        toast({
          title: 'Error',
          description: 'Failed to check two-factor authentication status',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkMFAStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, toast, updateUserState]);  const handleEnableMFA = async () => {
    if (!user) return;
    
    setSetupMode(true);
    setIsLoading(true);
    
    try {
      console.log('Starting MFA setup process');
      
      // Create recovery codes first
      const recoveryCodesResponse = await appwriteMFA.createRecoveryCodes();
      console.log('Recovery codes created:', recoveryCodesResponse);
      
      // Store the recovery codes for display
      if (recoveryCodesResponse && Array.isArray(recoveryCodesResponse.recoveryCodes)) {
        setRecoveryCodes(recoveryCodesResponse.recoveryCodes);
      } else {
        console.error('Invalid recovery codes response:', recoveryCodesResponse);
        setRecoveryCodes([]);
      }
      
      // Create an email challenge (this will send the verification email)
      const challenge = await appwriteMFA.createEmailChallenge();
      console.log('Email challenge created:', challenge);
      
      setVerificationSent(true);
      toast({
        title: 'Verification Code Sent',
        description: `Check your email for the verification code.`,
      });
      
      // Store challenge ID for verification
      if (challenge && challenge.$id) {
        setGeneratedCode(challenge.$id);
      } else {
        throw new Error('Invalid challenge response');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: 'Error',
        description: 'Failed to begin setup process. Please try again.',
        variant: 'destructive',
      });
      setSetupMode(false);
    } finally {
      setIsLoading(false);
    }
  };
  // This method is no longer needed since verification is handled by MFAVerificationDialog
  // Kept for compatibility with existing code references
  const handleVerifyAndEnable = async () => {
    // No-op - verification now happens in the MFAVerificationDialog component
    console.log('MFA verification handled by MFAVerificationDialog component');
  };
  const handleDisableMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log('Disabling MFA...');
      
      // Disable MFA using Appwrite MFA API
      const result = await appwriteMFA.updateMFA(false);
      console.log('MFA disable result:', result);
      
      // Force re-check the status after disabling
      const checkStatus = await appwriteMFA.isMFAEnabled();
      console.log('MFA status after disabling:', checkStatus);
      
      // Update local state
      setIsEnabled(false);
      updateUserState({ twoFactorEnabled: false });
      
      toast({
        title: 'Two-Factor Authentication Disabled',
        description: 'Two-factor authentication has been turned off.',
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable two-factor authentication.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelSetup = () => {
    setSetupMode(false);
    setVerifyCode('');
    setVerificationSent(false);
    setGeneratedCode(null);
  };
  
  if (isLoading && !setupMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
    if (setupMode) {
    // First show recovery codes if available
    if (showRecoveryCodes && recoveryCodes.length > 0) {
      return (
        <RecoveryCodesDisplay 
          recoveryCodes={recoveryCodes}
          onClose={() => setShowRecoveryCodes(false)}
        />
      );
    }
    
    // Then use the MFA verification dialog if we have a challenge ID
    if (generatedCode && user?.email) {
      return (
        <MFAVerificationDialog
          email={user.email}
          challengeId={generatedCode}
          onSuccess={() => {
            setIsEnabled(true);
            updateUserState({ twoFactorEnabled: true });
            setSetupMode(false);
            setVerifyCode('');
            
            toast({
              title: 'Two-Factor Authentication Enabled',
              description: 'Your account is now more secure.',
            });
          }}
          onCancel={handleCancelSetup}
          recoveryCodes={recoveryCodes}
        />
      );
    }
    
    // Fallback while waiting for challenge to be created
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Initializing Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Please wait while we set up your 2FA...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Email Verification</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={isEnabled ? handleDisableMFA : handleEnableMFA}
            disabled={isLoading}
          />
        </div>
        
        {isEnabled && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900/30">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Your account is protected with two-factor authentication. 
                You'll receive a verification code via email each time you log in.
              </p>
            </div>
          </div>
        )}          {!isEnabled && (
          <>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-900/30">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  We recommend enabling 2FA to protect your account. 
                  You'll receive a verification code via email when you log in.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30 mt-3">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold">Required Setup:</p>
                  <ol className="list-decimal pl-4 space-y-1 mt-1">
                    <li>Run <code className="bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded">setup-2fa.bat</code> script</li>
                    <li>In Appwrite, create collections:
                      <ul className="list-disc pl-4 mt-0.5">
                        <li><code className="bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded">two_factor_codes</code></li>
                        <li><code className="bg-blue-100 dark:bg-blue-800/40 px-1 py-0.5 rounded">user_preferences</code></li>
                      </ul>
                    </li>
                    <li>Add the attributes from the setup script</li>
                    <li>Create a function for sending 2FA emails</li>
                  </ol>
                  <p className="mt-2">Until these collections are created, 2FA settings will be stored locally for testing.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant={isEnabled ? "destructive" : "default"} 
          className="w-full"
          onClick={isEnabled ? handleDisableMFA : handleEnableMFA}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
        </Button>
      </CardFooter>
    </Card>
  );
}