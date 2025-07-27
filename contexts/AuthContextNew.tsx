'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/appwrite';
import { account } from '@/lib/appwrite';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  requires2FA: boolean;
  twoFactorChallenge: string | null;
  isOffline: boolean;
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error: any) {
        console.error('Error getting current user:', error);
        if (error.message?.includes('More factors are required') || error.type === 'user_more_factors_required') {
          setRequires2FA(true);
          try {
            if (account) {
              const challenge = await account.createMfaChallenge('email' as any);
              setTwoFactorChallenge(challenge.$id);
            }
          } catch (challengeError) {
            console.error('Failed to create MFA challenge:', challengeError);
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
  }, []);

  useEffect(() => {
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

  const login = async (email: string, password: string) => {
    try {
      if (account) {
        await account.createEmailPasswordSession(email, password);
        
        try {
          const user = await getCurrentUser();
          setUser(user);
          setRequires2FA(false);
          setTwoFactorChallenge(null);
        } catch (userError: any) {
          if (userError.message?.includes('More factors are required') || userError.type === 'user_more_factors_required') {
            setRequires2FA(true);
            const challenge = await account.createMfaChallenge('email' as any);
            setTwoFactorChallenge(challenge.$id);
            throw new Error('2FA_REQUIRED');
          }
          throw userError;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === '2FA_REQUIRED') {
        throw error;
      }
      throw error;
    }
  };

  const complete2FAChallenge = async (challengeId: string, code: string) => {
    try {
      if (account) {
        await account.updateMfaChallenge(challengeId, code);
        const user = await getCurrentUser();
        setUser(user);
        setRequires2FA(false);
        setTwoFactorChallenge(null);
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    // Implementation placeholder
  };

  const logout = async () => {
    // Implementation placeholder
    setUser(null);
  };

  const value = {
    user,
    loading,
    requires2FA,
    twoFactorChallenge,
    isOffline,
    login,
    register,
    logout,
    complete2FAChallenge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}