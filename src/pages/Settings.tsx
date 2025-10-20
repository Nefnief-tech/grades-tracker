'use client';

import React from 'react';
import { useAuth } from '../lib/auth';
import { EmailVerification } from '../components/auth/EmailVerification';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { User, Shield, Mail, Settings as SettingsIcon } from 'lucide-react';

export const getServerSideProps = async () => {
  return { props: {} };
};

export default function Settings() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <SettingsIcon className="h-6 w-6 text-gray-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Account Information */}
            <div>
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Verified:</span>
                  <span className={`font-medium ${user.emailVerification ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerification ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Verification */}
            {!user.emailVerification && (
              <div>
                <div className="flex items-center mb-4">
                  <Mail className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Email Verification</h2>
                </div>
                <EmailVerification />
              </div>
            )}

            {/* Two-Factor Authentication */}
            {user.emailVerification && (
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                </div>
                <TwoFactorSetup />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}