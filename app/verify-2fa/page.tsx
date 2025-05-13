'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { Email2FAService } from '@/lib/email-2fa';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyTwoFactorPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize timer for resend cooldown
  useEffect(() => {
    // Get user data from session storage (set during login)
    const storedUserId = sessionStorage.getItem('pendingVerificationUserId');
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
    const storedName = sessionStorage.getItem('pendingVerificationName');
    
    if (!storedUserId || !storedEmail) {
      // Redirect to login if no pending verification
      window.location.href = '/login';
      return;
    }
    
    setUserId(storedUserId);
    setUserEmail(storedEmail);
    setUserName(storedName || 'User');
    
    // Start countdown timer (60 seconds for resend)
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !userId) {
      setStatus('error');
      setMessage('Please enter the verification code.');
      return;
    }

    setStatus('loading');

    try {
      const twoFactorService = new Email2FAService();
      const verified = await twoFactorService.verifyCode(userId, verificationCode);
      
      if (verified) {
        setStatus('success');
        setMessage('Verification successful! Redirecting to dashboard...');
        
        // Clear temporary storage
        sessionStorage.removeItem('pendingVerificationUserId');
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationName');
        
        // Set verification complete flag
        sessionStorage.setItem('verificationComplete', 'true');
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Invalid or expired verification code. Please try again or request a new code.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setStatus('error');
      setMessage('An error occurred while verifying the code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || !userId || !userEmail) return;
    
    setStatus('loading');
    setMessage('Sending a new verification code...');
    
    try {
      // Get a new verification code
      const twoFactorService = new Email2FAService();
      const code = await twoFactorService.generateAndStoreCode(userId);
      
      if (code) {
        // Send the code via email
        await twoFactorService.sendVerificationEmail(
          userEmail,
          userName || 'User',
          code
        );
        
        setStatus('idle');
        setMessage('');
        setTimer(60); // Reset timer
        
        toast({
          title: 'Code Sent',
          description: 'A new verification code has been sent to your email.',
        });
        
        // Start countdown again
        const interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        setStatus('error');
        setMessage('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setStatus('error');
      setMessage('An error occurred while sending the code. Please try again.');
    }
  };

  const handleCancel = () => {
    // Clear temporary storage
    sessionStorage.removeItem('pendingVerificationUserId');
    sessionStorage.removeItem('pendingVerificationEmail');
    sessionStorage.removeItem('pendingVerificationName');
    
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Please enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <div className="text-center mb-2">
              <Mail className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                A verification code has been sent to {userEmail}
              </p>
            </div>
            
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                  required
                />
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleVerifyCode}
              className="w-full"
              disabled={status === 'loading' || status === 'success' || !verificationCode}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : 'Verify Code'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleResendCode}
              disabled={timer > 0 || status === 'loading' || status === 'success'}
              className="w-full"
            >
              {timer > 0 ? `Resend code (${timer}s)` : 'Resend Code'}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              disabled={status === 'loading' || status === 'success'}
              className="w-full text-muted-foreground"
            >
              Cancel and Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}