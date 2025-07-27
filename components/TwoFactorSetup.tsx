'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Mail } from 'lucide-react';
import TOTPSetup from './TOTPSetup';

interface TwoFactorSetupProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
  userEmail?: string;
}

export default function TwoFactorSetup({ onComplete, onCancel, userEmail }: TwoFactorSetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<'choice' | 'totp'>('choice');

  const handleMethodComplete = (success: boolean) => {
    if (success) {
      onComplete(true);
    } else {
      setSelectedMethod('choice');
    }
  };

  const handleMethodCancel = () => {
    setSelectedMethod('choice');
  };  // Show TOTP setup if selected
  if (selectedMethod === 'totp') {
    return (
      <TOTPSetup 
        onComplete={handleMethodComplete}
        onCancel={handleMethodCancel}
      />
    );
  }
  // Show choice screen
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Secure your account with an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-medium">Authenticator App</span>
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                Recommended
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Use Google Authenticator, Authy, or any TOTP app. Works offline and provides the best security.
            </p>
            <Button
              onClick={() => setSelectedMethod('totp')}
              className="w-full"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Setup Authenticator App
            </Button>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Email Verification Note:</strong> Appwrite uses email verification for password resets and account recovery, but not for daily login 2FA. For the best security, please use an authenticator app.
            </AlertDescription>
          </Alert>
        </div>

        <div className="pt-2">
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}