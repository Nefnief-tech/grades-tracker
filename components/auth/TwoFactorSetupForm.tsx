"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Smartphone, Mail, CheckCircle, Copy, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TwoFactorSetupFormProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

type SetupMethod = 'app' | 'email';

export function TwoFactorSetupForm({ onSetupComplete, onCancel }: TwoFactorSetupFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<SetupMethod>('app');
  const [step, setStep] = useState<'method' | 'setup' | 'verify'>('method');
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock QR code and secret for demo
  const mockSecret = "JBSWY3DPEHPK3PXP";
  const mockQrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

  const handleMethodSelect = async (method: SetupMethod) => {
    setSelectedMethod(method);
    setIsLoading(true);
    setError("");

    try {
      // TODO: Replace with actual API call to generate QR code or send email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (method === 'app') {
        setQrCodeUrl(mockQrCode);
      }
      
      setStep('setup');
    } catch (err) {
      setError("Failed to initialize 2FA setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (verificationCode === "123456") { // Mock verification
        // Generate mock backup codes
        const codes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substr(2, 4).toUpperCase()
        );
        setBackupCodes(codes);
        setStep('verify');
        
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled.",
        });
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const copyAllBackupCodes = () => {
    const allCodes = backupCodes.join('\n');
    copyToClipboard(allCodes);
  };

  if (step === 'method') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-center">Enable Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred method for two-factor authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === 'app' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedMethod('app')}
            >
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">Authenticator App</h3>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use Google Authenticator, Authy, or similar apps
                  </p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === 'email' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedMethod('email')}
            >
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">Email Verification</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive verification codes via email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex space-x-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => handleMethodSelect(selectedMethod)} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">
            {selectedMethod === 'app' ? 'Scan QR Code' : 'Email Verification Setup'}
          </CardTitle>
          <CardDescription className="text-center">
            {selectedMethod === 'app' 
              ? 'Scan the QR code with your authenticator app'
              : 'We\'ll send verification codes to your email'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedMethod === 'app' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 border rounded-lg bg-white">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Manual Setup Key</Label>
                <div className="flex items-center space-x-2">
                  <Input value={mockSecret} readOnly className="font-mono text-sm" />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(mockSecret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you can't scan the QR code, enter this key manually
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  {selectedMethod === 'app' ? 'Verification Code' : 'Email Verification Code'}
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {selectedMethod === 'app' 
                    ? 'Enter the code from your authenticator app'
                    : 'Check your email for the verification code'
                  }
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Backup codes step
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-center">2FA Successfully Enabled</CardTitle>
        <CardDescription className="text-center">
          Save these backup codes in a safe place
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            These backup codes can be used to access your account if you lose access to your {selectedMethod === 'app' ? 'authenticator app' : 'email'}. 
            Each code can only be used once.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Backup Codes</Label>
            <Button variant="outline" size="sm" onClick={copyAllBackupCodes}>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-muted rounded text-center font-mono text-sm">
                {code}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onSetupComplete} className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Setup
        </Button>
      </CardFooter>
    </Card>
  );
}