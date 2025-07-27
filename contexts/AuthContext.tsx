'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/appwrite';
import { account } from '@/lib/appwrite';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  requires2FA: boolean;
  twoFactorChallenge: string | null;
  isOffline: boolean;
  mounted: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  complete2FAChallenge: (challengeId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setRequires2FA(false);
        setTwoFactorChallenge(null);
      } catch (error: any) {
        console.error('Error getting current user:', error);        if (error.message?.includes('More factors are required') || error.type === 'user_more_factors_required') {
          // Check if we have an active session but need 2FA
          try {
            if (account) {
              const session = await account.getSession('current');
              if (session) {
                // User has a session but needs 2FA, don't redirect to landing
                setRequires2FA(true);
                try {
                  const challenge = await account.createMfaChallenge('email' as any);
                  setTwoFactorChallenge(challenge.$id);
                } catch (challengeError) {
                  console.error('Failed to create MFA challenge:', challengeError);
                  setUser(null);
                }
              } else {
                // No session, user needs to login
                setUser(null);
              }
            } else {
              setUser(null);
            }
          } catch (sessionError) {
            // No session exists, user needs to login
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Updated login function to properly handle 2FA
  const loginWith2FA = async (email: string, password: string) => {
    if (loading) return;
    setLoading(true);
    try {
      if (account) {
        await account.createEmailPasswordSession(email, password);
        
        // Try to get current user - this will fail if 2FA is required
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setRequires2FA(false);
          setTwoFactorChallenge(null);
          
          // Redirect to dashboard after successful login
          router.push('/dashboard');        } catch (userError: any) {
          // Check if error is about needing more factors (2FA)
          if (userError.message?.includes('More factors are required')) {
            console.log('2FA required, creating challenge...');
            setRequires2FA(true);
            
            // Create 2FA challenge
            try {
              const challenge = await account.createMfaChallenge('totp' as any);
              setTwoFactorChallenge(challenge.$id);
              console.log('2FA challenge created:', challenge.$id);
              
              // Don't redirect - user needs to complete 2FA
              return;
            } catch (challengeError: any) {              console.error('Failed to create 2FA challenge:', challengeError);
              
              // If challenge creation fails, it might mean 2FA isn't properly set up
              if (challengeError.message?.includes('User does not have any authenticators') || 
                  challengeError.message?.includes('No authenticators found')) {
                // User needs to set up 2FA first
                throw new Error('2FA_SETUP_REQUIRED');
              }
              throw new Error('2FA_REQUIRED');
            }
          } else {
            // Re-throw other user errors
            throw userError;
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);      // Check if this is a 2FA requirement error
      if (error.message?.includes('More factors are required')) {
        console.log('Direct "More factors required" error detected - user needs 2FA setup');
        
        // Since user gets this error, they have 2FA enabled but no authenticators configured
        // Skip trying to create challenges and go directly to setup
        throw new Error('2FA_SETUP_REQUIRED');
      }
      
      if (error.message === '2FA_REQUIRED' || error.message === '2FA_SETUP_REQUIRED') {
        throw error; // Pass through the specific error type
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };  const complete2FAChallenge = async (challengeId: string, code: string) => {
    try {
      if (account) {
        await account.updateMfaChallenge(challengeId, code);
        const user = await getCurrentUser();
        setUser(user);
        setRequires2FA(false);
        setTwoFactorChallenge(null);
        
        // Redirect to dashboard after successful 2FA
        router.push('/');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      if (account) {
        // Create the account
        const newUser = await account.create('unique()', email, password, name);
        console.log('Account created successfully:', newUser);
        
        // Automatically log in the user after registration
        const session = await account.createEmailPasswordSession(email, password);
        console.log('Session created:', session);
          // Send email verification AFTER login
        try {
          const verification = await account.createVerification('http://localhost:3000/verify-email');
          console.log('Verification email sent:', verification);
        } catch (verificationError) {
          console.error('Failed to send verification email:', verificationError);
          // Continue without blocking registration
        }
        
        // Get the current user (this might fail due to schema mismatch)
        try {
          const currentUser = await getCurrentUser();
          console.log('Current user retrieved:', currentUser);
          setUser(currentUser);
        } catch (getUserError) {
          console.warn('Failed to get user details, but login successful:', getUserError);
          // Set basic user info from the account creation
          setUser({
            id: newUser.$id,
            email: newUser.email,
            name: newUser.name,
            emailVerification: newUser.emailVerification
          });
        }
        
        setRequires2FA(false);
        setTwoFactorChallenge(null);
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      if (account) {
        await account.deleteSession('current');
      }
      setUser(null);
      setRequires2FA(false);
      setTwoFactorChallenge(null);
      router.push('/landing');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setRequires2FA(false);
      setTwoFactorChallenge(null);
      router.push('/landing');
    } finally {
      setLoading(false);
    }
  };
  // Updated verifyTwoFactor function with redirect
  const verifyTwoFactorComplete = async (challengeId: string, code: string) => {
    if (loading) return;
    setLoading(true);
    try {
      if (account) {
        await account.updateMfaChallenge(challengeId, code);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setRequires2FA(false);
        setTwoFactorChallenge(null);
        
        // Redirect to dashboard after successful 2FA
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    requires2FA,
    twoFactorChallenge,
    isOffline,
    mounted,
    login: loginWith2FA,
    register,
    logout,
    complete2FAChallenge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}