'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function SecuritySettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();

  const handleToggle2FA = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const newValue = !is2FAEnabled;
    
    try {
      // Update the user's 2FA settings
      // In a real implementation, this would be stored in a database
      updateUserState({ twoFactorEnabled: newValue });
      setIs2FAEnabled(newValue);
      
      toast({
        title: newValue ? '2FA Enabled' : '2FA Disabled',
        description: newValue 
          ? 'Two-factor authentication has been enabled for your account.' 
          : 'Two-factor authentication has been disabled.',
      });
    } catch (error) {
      console.error('Failed to update 2FA settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update 2FA settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Manage your account security options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
              disabled={isLoading}
            />
          </div>
          
          {is2FAEnabled && (
            <div className="rounded-md bg-primary/10 p-4">
              <div className="flex">
                <Info className="h-5 w-5 mr-3 text-primary" />
                <div className="text-sm">
                  <p>When you log in, you'll need to enter a verification code sent to your email.</p>
                  <p className="mt-2">This helps prevent unauthorized access to your account.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}