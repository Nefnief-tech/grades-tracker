"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  handleMfaLogin, 
  verifyMfaChallenge 
} from '@/lib/mfa-login';
import { useAuth } from "@/contexts/AuthContext";

// Component for direct MFA login
export default function DirectMFALoginPage() {
  // Get URL parameters (to support redirecting with challenge info)
  const searchParams = useSearchParams();
  const initialChallengeId = searchParams.get('challengeId') || '';
  const initialEmail = searchParams.get('email') || '';
  
  // Login form state
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  
  // MFA verification state
  const [showMfaVerify, setShowMfaVerify] = useState(!!initialChallengeId);
  const [verificationCode, setVerificationCode] = useState("");
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { updateUserState } = useAuth();

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    console.log(`Logging in with ${email}...`);
    
    try {
      // Use the MFA handler to attempt login
      const result = await handleMfaLogin(email, password);
      console.log("Login result:", result);
      
      // Check if login was successful
      if (result.success && result.user) {
        console.log("Login successful, updating user state and redirecting");
        updateUserState(result.user);
        router.push("/dashboard");
        return;
      }
      
      // Check if MFA is required
      if (result.requiresMFA && result.mfaChallenge) {
        console.log("MFA required, showing verification UI");
        setChallengeId(result.mfaChallenge.challengeId);
        setShowMfaVerify(true);
        return;
      }
      
      // Handle error
      setError(result.error || "Login failed");
    } catch (error: any) {
      console.error("Error during login:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    console.log(`Verifying code ${verificationCode} for challenge ${challengeId}...`);
    
    try {
      // Verify the MFA challenge
      const result = await verifyMfaChallenge(challengeId, verificationCode);
      
      // Check if verification was successful
      if (result.success && result.user) {
        console.log("Verification successful, updating user and redirecting");
        // Update user state in auth context
        updateUserState(result.user);
        router.push("/dashboard");
        return;
      }
      
      // Handle error
      setError(result.error || "Verification failed");
    } catch (error: any) {
      console.error("Error during verification:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Switch back to login form
  const handleBackToLogin = () => {
    setShowMfaVerify(false);
    setVerificationCode("");
    
    // Clear challenge ID from URL
    router.replace("/direct-mfa-login");
  };
  
  // Handle auto-submit for verification codes
  useEffect(() => {
    // Auto-submit if code is 6 digits long
    if (verificationCode.length === 6 && challengeId) {
      const form = document.getElementById('mfa-form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  }, [verificationCode, challengeId]);

  // MFA verification UI
  if (showMfaVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">Two-Factor Authentication</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-md text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <p>A verification code has been sent to your email address.</p>
            <p className="text-sm mt-1">Please enter the 6-digit code below.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md text-red-800 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          
          <form id="mfa-form" onSubmit={handleVerify}>
            <div className="mb-6">
              <label htmlFor="verification-code" className="block mb-2 font-medium dark:text-white">
                Verification Code
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                className="w-full p-3 border rounded-md text-center text-xl tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="123456"
                autoFocus
                maxLength={6}
                required
              />
            </div>
            
            <div className="text-sm mb-6">
              <button
                type="button"
                className="text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => {
                  // This would refresh the challenge
                  setVerificationCode("");
                  handleLogin({ preventDefault: () => {} } as React.FormEvent);
                }}
              >
                Didn't receive a code? Send a new one
              </button>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={isLoading || verificationCode.length < 6}
                className={`px-4 py-2 rounded-md ${
                  isLoading || verificationCode.length < 6
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Login form UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Login</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-medium dark:text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="font-medium dark:text-white">
                Password
              </label>
              <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm dark:text-blue-400">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          
          <div className="text-center mt-6 dark:text-white">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}