'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserPreferencesService } from '@/lib/user-preferences';
import { Shield, Loader2 } from 'lucide-react';

export function TwoFactorToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();
  const preferencesService = new UserPreferencesService();
  
  // Load 2FA status
  useEffect(() => {
    const loadTwoFactorStatus = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const twoFactorEnabled = await preferencesService.getTwoFactorEnabled(user.id);
        setIsEnabled(twoFactorEnabled);
        
        // Update user object if needed
        if (user.twoFactorEnabled !== twoFactorEnabled) {
          updateUserState({ twoFactorEnabled });
        }
      } catch (error) {
        console.error('Error loading 2FA status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTwoFactorStatus();
  }, [user]);
  
  const handleToggle = async () => {
    if (!user || isLoading) return;
    
    const newValue = !isEnabled;
    setIsLoading(true);
    
    try {
      // Update in database
      await preferencesService.setTwoFactorEnabled(user.id, newValue);
      
      // Update local state
      setIsEnabled(newValue);
      updateUserState({ twoFactorEnabled: newValue });
      
      toast({
        title: newValue ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
        description: newValue 
          ? 'Your account is now more secure.' 
          : 'Two-factor authentication has been turned off.',
      });
    } catch (error) {
      console.error('Error updating 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to update two-factor authentication settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col space-y-1">
        <Label className="text-base flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Two-Factor Authentication
        </Label>
        <p className="text-sm text-muted-foreground">
          Receive a verification code via email when you log in
        </p>
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Switch 
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      )}
    </div>
  );
}