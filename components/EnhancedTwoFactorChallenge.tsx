import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedTwoFactorChallengeProps {
  challengeId: string;
  onSuccess: () => void;
  onBack: () => void;
  userEmail?: string;
}

export function EnhancedTwoFactorChallenge({ 
  challengeId, 
  onSuccess, 
  onBack, 
  userEmail 
}: EnhancedTwoFactorChallengeProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeType, setChallengeType] = useState<'unknown' | 'totp' | 'email'>('unknown');
  const { toast } = useToast();

  // Try to detect challenge type
  useEffect(() => {
    detectChallengeType();
  }, [challengeId]);

  const detectChallengeType = async () => {
    try {
      if (account) {
        // Try to get challenge info to determine type
        // This is a best guess based on typical patterns
        console.log('Detecting challenge type for:', challengeId);
        
        // For now, we'll assume it's TOTP first, then email
        // You might need to adjust this based on Appwrite's API
        setChallengeType('totp');
      }
    } catch (error) {
      console.log('Could not detect challenge type:', error);
      setChallengeType('unknown');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {      if (account) {
        console.log('Verifying 2FA code:', code, 'for challenge:', challengeId);
        await account.updateMfaChallenge(challengeId, code);
        console.log('2FA verification successful');
        
        toast({
          title: "Verification successful",
          description: "Redirecting to dashboard...",
        });
        
        // Call the success callback which should handle redirection
        onSuccess();
      }
    } catch (error: any) {
      console.error('2FA verification failed:', error);
      
      if (error.message?.includes('Invalid token')) {
        if (challengeType === 'totp') {
          setError('Invalid code. Please check your authenticator app and try again.');
        } else if (challengeType === 'email') {
          setError('Invalid code. Please check your email and try again.');
        } else {
          setError('Invalid code. Please check your authenticator app or email and try again.');
        }
      } else if (error.message?.includes('expired')) {
        setError('Verification code has expired. Please go back and try logging in again.');
      } else {
        setError(error.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (challengeType !== 'email') {
      toast({
        title: "Cannot resend",
        description: "Authenticator app codes refresh automatically every 30 seconds",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (account) {
        // Create a new email challenge
        const newChallenge = await account.createMfaChallenge('email' as any);
        console.log('New email challenge created:', newChallenge.$id);
        
        toast({
          title: "Code resent",
          description: "A new verification code has been sent to your email",
        });
      }
    } catch (error: any) {
      console.error('Failed to resend code:', error);
      toast({
        title: "Resend failed",
        description: "Could not resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructions = () => {
    switch (challengeType) {
      case 'totp':
        return {
          title: "Enter Authenticator Code",
          description: "Open your authenticator app and enter the 6-digit code",
          icon: "📱",
          details: "The code refreshes every 30 seconds"
        };
      case 'email':
        return {
          title: "Enter Email Code",
          description: `Check your email at ${userEmail} for the verification code`,
          icon: "📧",
          details: "The code was sent to your email address"
        };
      default:
        return {
          title: "Enter Verification Code",
          description: "Enter the 6-digit code from your authenticator app or email",
          icon: "🔐",
          details: "Check both your authenticator app and email"
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="text-2xl mb-2">{instructions.icon}</div>
            <CardTitle>{instructions.title}</CardTitle>
            <CardDescription>{instructions.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  {instructions.details}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Code
                    </>
                  )}
                </Button>

                {challengeType === 'email' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resendCode}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Email Code
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}