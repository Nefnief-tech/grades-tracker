import React, { useState, useEffect } from 'react';
import { account } from '../../lib/appwrite';
import { useAuth } from '../../lib/auth';
import { Shield, Mail, Check, X, RefreshCw } from 'lucide-react';

export function TwoFactorSetup() {
  const { user, refreshUser } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [challenge, setChallenge] = useState<string | null>(null);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const factors = await account.listMfaFactors();
      setIsEnabled(factors.email);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const challengeResponse = await account.createMfaChallenge('email');
      setChallenge(challengeResponse.$id);
      setIsVerifying(true);
    } catch (error: any) {
      console.error('Failed to enable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!challenge || !verificationCode.trim()) return;

    try {
      setIsLoading(true);
      await account.updateMfaChallenge(challenge, verificationCode);
      await refreshUser();
      setIsEnabled(true);
      setIsVerifying(false);
      setVerificationCode('');
      setChallenge(null);
    } catch (error: any) {
      console.error('Failed to verify code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      await account.deleteMfaFactor('email');
      await refreshUser();
      setIsEnabled(false);
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setIsVerifying(false);
    setVerificationCode('');
    setChallenge(null);
  };

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verify Email Code
              </h3>
              <p className="text-sm text-gray-600">
                Enter the verification code sent to your email
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Verify & Enable
                  </>
                )}
              </button>
              <button
                onClick={handleCancelSetup}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Email Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Email Authentication</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {!isEnabled ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                When enabled, you'll receive a verification code via email each time you sign in.
              </p>
              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Email 2FA
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Email 2FA is currently enabled. You can disable it if you no longer want this security feature.
              </p>
              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Disable Email 2FA
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}