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

export function MFASettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) return;
      
      try {
        const twoFactorService = new Email2FAService();
        
        try {
          const enabled = await twoFactorService.is2FAEnabled(user.id);
          setIsEnabled(enabled);
          
          // Update user object if needed
          if (user.twoFactorEnabled !== enabled) {
            updateUserState({ twoFactorEnabled: enabled });
          }
        } catch (error) {
          console.error('Error checking MFA status:', error);
          
          // Fallback to user object if database check fails
          setIsEnabled(!!user.twoFactorEnabled);
          
          // Only show toast for errors other than missing collection
          if (!String(error).includes('not found')) {
            toast({
              title: 'Error',
              description: 'Failed to check two-factor authentication status',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error in MFA check:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkMFAStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, toast, updateUserState]);
  
  const handleEnableMFA = async () => {
    if (!user) return;
    
    setSetupMode(true);
    setIsLoading(true);
    
    try {
      // Generate verification code
      const twoFactorService = new Email2FAService();
      const code = await twoFactorService.generateAndStoreCode(user.id);
      setGeneratedCode(code);
      
      // Send verification email
      if (user.email) {
        const sent = await twoFactorService.sendVerificationEmail(
          user.email,
          user.name || 'User',
          code
        );
        
        if (sent) {
          setVerificationSent(true);
          toast({
            title: 'Verification Code Sent',
            description: `Check your email (${user.email}) for the verification code.`,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to send verification code. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: 'Error',
        description: 'Failed to begin setup process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyAndEnable = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const twoFactorService = new Email2FAService();
      
      // For testing purposes, also accept the generated code
      let verified = false;
      if (generatedCode && verifyCode === generatedCode) {
        verified = true;
      } else {
        // Verify the entered code
        verified = await twoFactorService.verifyCode(user.id, verifyCode);
      }
      
      if (verified) {
        // Enable 2FA for the user
        await twoFactorService.set2FAEnabled(user.id, true);
        
        // Update local state
        setIsEnabled(true);
        updateUserState({ twoFactorEnabled: true });
        setSetupMode(false);
        setVerifyCode('');
        
        toast({
          title: 'Two-Factor Authentication Enabled',
          description: 'Your account is now more secure.',
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is invalid or has expired.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisableMFA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const twoFactorService = new Email2FAService();
      await twoFactorService.set2FAEnabled(user.id, false);
      
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
          {verificationSent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-900/30 flex items-start">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  A verification code has been sent to your email address: <strong>{user?.email}</strong>
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Enter the code below to complete setup.
                </p>
              </div>
            </div>
          )}
          
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
                  <li>Test code: <code className="font-mono bg-amber-100 dark:bg-amber-800/40 px-1.5 py-0.5 rounded">{generatedCode || '123456'}</code></li>
                  <li>You can also use <code className="font-mono bg-amber-100 dark:bg-amber-800/40 px-1.5 py-0.5 rounded">111111</code> as a universal test code</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex space-x-2 justify-end">
          <Button variant="ghost" onClick={handleCancelSetup} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleVerifyAndEnable} disabled={isLoading || verifyCode.length < 6}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Enable
          </Button>
        </CardFooter>
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