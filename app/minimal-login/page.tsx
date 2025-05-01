'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as appwriteLogin, getCurrentUser } from '@/lib/appwrite';
import appwriteMFA from '@/lib/appwrite-mfa';

export default function MinimalLoginPage() {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // MFA verification state
  const [showMfa, setShowMfa] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Try regular login
      await appwriteLogin(email, password);
      
      try {
        // Try to get user data
        const user = await getCurrentUser();
        // Success! No MFA needed
        router.push('/dashboard');
      } catch (userError: any) {
        // Check if MFA is required
        if (userError?.message?.includes('More factors are required')) {
          // Create email challenge
          const challenge = await appwriteMFA.createEmailChallenge();
          setChallengeId(challenge.$id);
          setShowMfa(true);
        } else {
          throw userError;
        }
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle verification code submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Verify challenge
      await appwriteMFA.verifyChallenge(challengeId, verificationCode);
      
      // Get user data
      await getCurrentUser();
      
      // Success!
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show MFA verification UI
  if (showMfa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Two-Factor Authentication</h1>
          <p className="mb-4">Please enter the verification code sent to your email.</p>
          
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
          
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="123456"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            
            <button
              type="button"
              className="w-full mt-2 text-blue-500 p-2 rounded"
              onClick={() => setShowMfa(false)}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Show login form UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="mb-4">Enter your credentials to access your account.</p>
        
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}