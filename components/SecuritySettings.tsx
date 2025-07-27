'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Smartphone, Mail, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);  const [mfaStatus, setMfaStatus] = useState<{
    enabled: boolean;
    methods: string[];
    checking: boolean;
  }>({
    enabled: false,
    methods: [],
    checking: true
  });
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    if (!account || !user) return;
    
    setMfaStatus(prev => ({ ...prev, checking: true }));
    setError('');

    try {
      console.log('Checking MFA status...');
      
      // Try to list MFA factors
      try {
        const factors = await account.listMfaFactors();
        console.log('MFA factors:', factors);        const methods: string[] = [];
        let enabled = false;

        // Handle the actual MFA factors response structure
        if (factors.totp === true) {
          methods.push('TOTP');
          enabled = true;
        }
        
        if (factors.email === true) {
          methods.push('Email');
          enabled = true;
        }
        
        if (factors.phone === true) {
          methods.push('Phone');
          enabled = true;
        }
        
        if (factors.recoveryCode === true) {
          methods.push('Recovery Code');
          enabled = true;
        }

        setMfaStatus({
          enabled,
          methods,
          checking: false
        });
      } catch (factorError: any) {
        console.log('Could not list factors:', factorError);
        
        // Try creating a test challenge to determine status
        try {
          const testChallenge = await account.createMfaChallenge('totp' as any);
          console.log('Test TOTP challenge successful');
          setMfaStatus({
            enabled: true,
            methods: ['TOTP'],
            checking: false
          });
        } catch (totpError: any) {
          try {
            const emailChallenge = await account.createMfaChallenge('email' as any);
            console.log('Test email challenge successful');
            setMfaStatus({
              enabled: true,
              methods: ['Email'],
              checking: false
            });
          } catch (emailError: any) {
            console.log('No MFA methods available');
            setMfaStatus({
              enabled: false,
              methods: [],
              checking: false
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking MFA status:', error);
      setError(error.message);
      setMfaStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled) {
      // Show setup screen
      setShowSetup(true);
    } else {
      // Disable 2FA - this would require removing all authenticators
      setLoading(true);
      try {
        // Note: Appwrite doesn't have a direct "disable 2FA" method
        // You'd need to remove individual authenticators
        toast({
          title: "2FA Disable",
          description: "To disable 2FA, please contact support or remove authenticators individually",
          variant: "destructive",
        });
      } catch (error: any) {
        console.error('Error disabling 2FA:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to disable 2FA",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetupComplete = (success: boolean) => {
    setShowSetup(false);
    if (success) {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
      checkMFAStatus(); // Refresh status
    }
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md px-4">
          <TwoFactorSetup 
            onComplete={handleSetupComplete}
            onCancel={handleSetupCancel}
            userEmail={user?.email}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and two-factor authentication
        </p>
      </div>

      {/* 2FA Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Enable 2FA</span>
                {mfaStatus.checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mfaStatus.enabled ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Protect your account with verification codes
              </p>
            </div>
            <Switch
              checked={mfaStatus.enabled}
              onCheckedChange={handleToggle2FA}
              disabled={loading || mfaStatus.checking}
            />
          </div>

          {mfaStatus.enabled && mfaStatus.methods.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Methods:</p>
              <div className="flex flex-wrap gap-2">
                {mfaStatus.methods.map((method) => (
                  <Badge key={method} variant="outline" className="flex items-center gap-1">
                    {method === 'TOTP' ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Mail className="h-3 w-3" />
                    )}
                    {method === 'TOTP' ? 'Authenticator App' : 'Email Verification'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mfaStatus.enabled && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowSetup(true)}
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Add Another Method
              </Button>
              <Button
                variant="outline"
                onClick={checkMFAStatus}
                disabled={mfaStatus.checking}
              >
                {mfaStatus.checking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Refresh Status"
                )}
              </Button>
            </div>
          )}

          {!mfaStatus.enabled && !mfaStatus.checking && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is not enabled. Enable it to add an extra layer of security to your account.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
          <CardDescription>
            Best practices for keeping your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Use a strong, unique password</p>
              <p className="text-xs text-muted-foreground">
                Choose a password that's at least 12 characters long and unique to this account
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Enable two-factor authentication</p>
              <p className="text-xs text-muted-foreground">
                Use an authenticator app like Google Authenticator or Authy for the best security
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Keep your email secure</p>
              <p className="text-xs text-muted-foreground">
                Make sure your email account also has strong security measures
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}