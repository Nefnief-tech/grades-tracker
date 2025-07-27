import React from 'react';
import { useAuth } from '../../lib/auth';
import { AlertTriangle, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerificationPrompt() {
  const { user } = useAuth();

  if (!user || user.emailVerification) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Email Verification Required
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            Please verify your email address to access all features and ensure account security.
          </p>
          <div className="flex space-x-3">
            <Link
              to="/settings"
              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
            >
              <Mail className="h-4 w-4 mr-1" />
              Verify Email
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center px-3 py-1.5 bg-white text-yellow-800 text-sm font-medium rounded border border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <Shield className="h-4 w-4 mr-1" />
              Security Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}