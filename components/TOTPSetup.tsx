'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, ArrowLeft, Smartphone, QrCode, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeDisplay } from './QRCodeDisplay';

interface TOTPSetupProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export default function TOTPSetup({ onComplete, onCancel }: TOTPSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const setupTOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!account) {
        throw new Error('Authentication service not available');
      }
      
      console.log('Setting up TOTP authenticator...');
      const authenticator = await account.createMfaAuthenticator('totp' as any);
      console.log('TOTP authenticator created:', authenticator);
      
      // Extract the secret and QR code from the response
      if (authenticator.secret) {
        setSecret(authenticator.secret);
      }
      
      if (authenticator.uri) {
        setQrCode(authenticator.uri);
      }
      
      setStep('verify');
      toast({
        title: "Authenticator Ready",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error: any) {
      console.error('Failed to setup TOTP:', error);
      setError(error.message || 'Failed to setup authenticator app');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');    try {
      if (!account) {
        throw new Error('Authentication service not available');
      }
      
      console.log('Verifying TOTP code:', verificationCode);
      
      // In Appwrite, we need to verify the authenticator
      await account.updateMfaAuthenticator('totp' as any, verificationCode);
      
      onComplete(true);
      toast({
        title: "TOTP Enabled",
        description: "Authenticator app has been successfully configured",
      });
    } catch (error: any) {
      console.error('Failed to verify TOTP:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Secret Copied",
      description: "The secret key has been copied to your clipboard",
    });
  };
  // Auto-start setup when component mounts
  useEffect(() => {
    if (step === 'setup' && !qrCode && !isLoading) {
      setupTOTP();
    }
  }, []);

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle>Setting up Authenticator</CardTitle>
          </div>
          <CardDescription>
            Preparing your QR code...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            {error && (
              <Button onClick={setupTOTP} disabled={isLoading} className="flex-1">
                Retry Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <QrCode className="h-6 w-6 text-primary" />
          <CardTitle>Scan QR Code</CardTitle>
        </div>
        <CardDescription>
          Use your authenticator app to scan this code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">        {qrCode && (
          <div className="flex flex-col items-center space-y-4">
            {/* QR Code Display */}
            <div className="p-4 border-2 rounded-lg bg-white">
              <QRCodeDisplay uri={qrCode} size={200} />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Manual Entry Key:</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-xs font-mono flex-1 break-all">{secret}</code>
                <Button size="sm" variant="outline" onClick={copySecret}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key if you can't scan the QR code
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="verification-code" className="text-sm font-medium">
            Enter the 6-digit code from your app:
          </label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setVerificationCode(value);
              if (error) setError('');
            }}
            disabled={isLoading}
            className="text-center text-lg tracking-widest"
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={verifyTOTP} 
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify & Enable
              </>
            )}
          </Button>

          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel Setup
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>✓ Download Google Authenticator, Authy, or similar app</p>
          <p>✓ Scan the QR code or enter the key manually</p>
          <p>✓ Enter the 6-digit code to complete setup</p>
        </div>
      </CardContent>
    </Card>
  );
}