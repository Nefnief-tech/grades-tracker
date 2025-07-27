import React, { useState, useEffect } from 'react';
import { account } from '../../lib/appwrite';
import { useAuth } from '../../lib/auth';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationProps {
  onVerified?: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const { user, refreshUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await account.createVerification('http://localhost:5173/verify-email');
      // Success feedback
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      await refreshUser();
      if (user?.emailVerification) {
        onVerified?.();
      }
    } catch (error: any) {
      console.error('Failed to check verification status:', error);
    }
  };

  if (user?.emailVerification) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center p-6">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verified
          </h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center text-center p-6">
        <Mail className="h-16 w-16 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to{' '}
          <span className="font-medium text-gray-900">{user?.email}</span>. 
          Click the link in your email to verify your account.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={handleCheckStatus}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Verification Status
          </button>

          <button
            onClick={handleResendVerification}
            className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isResending || countdown > 0}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Verification Email'
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          Check your spam folder if you don't see the email
        </div>
      </div>
    </div>
  );
}