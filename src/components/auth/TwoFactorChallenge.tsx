import React, { useState } from 'react';
import { account } from '../../lib/appwrite';
import { Shield, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

interface TwoFactorChallengeProps {
  challengeId: string;
  onSuccess: () => void;
  onBack: () => void;
  userEmail: string;
}

export function TwoFactorChallenge({ challengeId, onSuccess, onBack, userEmail }: TwoFactorChallengeProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      await account.updateMfaChallenge(challengeId, code);
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  const handleResendCode = async () => {
    try {
      setIsVerifying(true);
      setError('');
      // Create a new challenge
      const newChallenge = await account.createMfaChallenge('email');
      // Note: In a real app, you'd want to update the challengeId in the parent component
    } catch (error: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-600">
              We've sent a verification code to your email
            </p>
            <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="verification-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isVerifying || code.length !== 6}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isVerifying ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isVerifying}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-1 inline" />
                Resend verification code
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={isVerifying}
                className="w-full text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}