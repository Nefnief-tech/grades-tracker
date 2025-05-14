'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Key, Lock } from 'lucide-react';

export function MFASettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodesVisible, setRecoveryCodesVisible] = useState(false);
  
  // Mock recovery codes
  const recoveryCodes = [
    'ABCD-EFGH-IJKL-MNOP',
    'QRST-UVWX-YZ12-3456',
    '7890-ABCD-EFGH-IJKL',
    'MNOP-QRST-UVWX-YZ12',
    '3456-7890-ABCD-EFGH'
  ];
  
  // Mock secret key for demo purposes only
  const mockSecretKey = 'JBSWY3DPEHPK3PXP';
  const mockQrCodeUrl = `otpauth://totp/GradeTracker:user@example.com?secret=${mockSecretKey}&issuer=GradeTracker`;
  
  const handleEnableMFA = () => {
    if (!mfaEnabled) {
      setShowSetup(true);
    } else {
      // In a real app, call API to disable MFA
      setMfaEnabled(false);
    }
  };
  
  const handleVerify = () => {
    // In a real app, validate the verification code
    if (verificationCode.length === 6) {
      setMfaEnabled(true);
      setShowSetup(false);
      setVerificationStep(false);
      setVerificationCode('');
      // Show recovery codes after successful verification
      setRecoveryCodesVisible(true);
    }
  };
  
  const handleContinue = () => {
    setVerificationStep(true);
  };
  
  const handleCancel = () => {
    setShowSetup(false);
    setVerificationStep(false);
    setVerificationCode('');
  };
  
  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    alert('Recovery codes copied to clipboard');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Multi-Factor Authentication</CardTitle>
            </div>
            <Switch
              checked={mfaEnabled}
              onCheckedChange={setMfaEnabled}
              disabled={showSetup}
            />
          </div>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showSetup && !mfaEnabled && (
            <div className="space-y-4">
              <p className="text-sm">
                When you enable two-factor authentication, you'll be asked for a code from your
                authentication app in addition to your password when you log in.
              </p>
              <Button onClick={handleEnableMFA}>
                <Shield className="mr-2 h-4 w-4" /> Enable Two-Factor Authentication
              </Button>
            </div>
          )}
          
          {mfaEnabled && !showSetup && !recoveryCodesVisible && (
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Two-factor authentication is enabled</AlertTitle>
                <AlertDescription>
                  Your account is now more secure. You'll need to enter a code from your authentication app when you sign in.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setRecoveryCodesVisible(true)}>
                  View Recovery Codes
                </Button>
                <Button variant="destructive" onClick={handleEnableMFA}>
                  Disable Two-Factor
                </Button>
              </div>
            </div>
          )}
          
          {showSetup && !verificationStep && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Set up two-factor authentication</h3>
                <ol className="list-decimal list-inside space-y-3">
                  <li>
                    Download an authentication app like Google Authenticator, Authy, or Microsoft Authenticator
                  </li>
                  <li>
                    Scan the QR code below or enter the setup key manually
                  </li>
                  <li>
                    Once configured, enter the 6-digit code to verify and complete setup
                  </li>
                </ol>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="w-[200px] h-[200px] bg-muted flex items-center justify-center border">
                  <p className="text-sm text-center p-4">QR Code placeholder<br/>(Install qrcode.react for actual QR code)</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Setup Key (manual entry):</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{mockSecretKey}</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {verificationStep && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Verify the setup</h3>
                <p className="text-sm">
                  Enter the 6-digit code from your authentication app to verify that the setup is working correctly.
                </p>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="verification-code">Authentication Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleVerify} disabled={verificationCode.length !== 6}>
                  Verify
                </Button>
              </div>
            </div>
          )}
          
          {recoveryCodesVisible && (
            <div className="space-y-6">
              <Alert>
                <AlertTitle>Save your recovery codes</AlertTitle>
                <AlertDescription>
                  If you lose access to your authentication app, you can use these recovery codes to sign in.
                  Keep these codes in a safe place, as they won't be shown again.
                </AlertDescription>
              </Alert>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recoveryCodes.map((code, index) => (
                    <code key={index} className="font-mono text-sm p-2 bg-white border rounded">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setRecoveryCodesVisible(false)}>
                  Done
                </Button>
                <Button onClick={copyRecoveryCodes}>
                  Copy Codes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Password Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your password and account security preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-muted-foreground">Update your password regularly for better security.</p>
            </div>
            <Button variant="outline">Update Password</Button>
          </div>
          
          <hr className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Require password change</div>
              <div className="text-sm text-muted-foreground">
                Force password changes every 90 days
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}