'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import { CheckCircle, AlertCircle, Loader2, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TwoFactorSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();
  
  // Use a property in the user object to track if 2FA is enabled
  // If your user object doesn't have this, you'll need to add it
  
  // Check if 2FA is enabled on component mount  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      setIsLoading(true);
      try {
        // First check if it's in the user object already
        if (user?.twoFactorEnabled !== undefined) {
          setIsEnabled(user.twoFactorEnabled);
        } else {
          // If not, get it from the preferences service
          const { UserPreferencesService } = await import('@/lib/user-preferences');
          const preferencesService = new UserPreferencesService();
          
          const twoFactorEnabled = await preferencesService.getTwoFactorEnabled(user.id);
          setIsEnabled(twoFactorEnabled);
          
          // Update the user object for future reference
          updateUserState({ twoFactorEnabled });
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load two-factor authentication settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user, toast, updateUserState]);
    const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;
    
    setStatus('loading');
    setIsEnabled(enabled);
    
    try {
      // Import the user preferences service
      const { UserPreferencesService } = await import('@/lib/user-preferences');
      const preferencesService = new UserPreferencesService();
      
      // Store the user's 2FA preference in the database
      await preferencesService.setTwoFactorEnabled(user.id, enabled);
      
      // Update local state
      updateUserState({ twoFactorEnabled: enabled });
      
      setStatus('success');
      setMessage(enabled 
        ? 'Two-factor authentication has been enabled for your account.' 
        : 'Two-factor authentication has been disabled for your account.'
      );
      
      toast({
        title: enabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
        description: enabled 
          ? 'Your account is now more secure.' 
          : 'Two-factor authentication has been turned off.',
        variant: enabled ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      setStatus('error');
      setMessage('Failed to update two-factor authentication settings. Please try again.');
      setIsEnabled(!enabled); // Revert the switch state
      
      toast({
        title: 'Error',
        description: 'Failed to update two-factor authentication settings.',
        variant: 'destructive',
      });
    } finally {
      // Reset status after a delay
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by requiring a verification code sent to your email each time you log in.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">Email Verification</Label>
            <p className="text-sm text-muted-foreground">
              Receive a verification code via email when you log in
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle2FA}
            disabled={status === 'loading'}
            aria-label="Toggle two-factor authentication"
          />
        </div>
        
        {isEnabled && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <div className="flex items-start">
              <Mail className="mr-3 h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">How it works</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  When you log in, we'll send a 6-digit verification code to your email 
                  address ({user?.email}). Enter that code on the verification page to 
                  complete your login.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {isEnabled && (
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => handleToggle2FA(false)}
            disabled={status === 'loading'}
          >
            Turn Off Two-Factor Authentication
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}