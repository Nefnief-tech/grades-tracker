import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../../lib/appwrite';
import type { Models } from 'appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  requiresEmailVerification: boolean;
  requires2FA: boolean;
  twoFactorChallenge: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  complete2FAChallenge: (challengeId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<string | null>(null);
  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      
      // Try to get current user - this will fail if MFA is required
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        
        // Check if email verification is required
        if (!currentUser.emailVerification) {
          setRequiresEmailVerification(true);
          await sendEmailVerification();
        }
      } catch (userError: any) {
        // Check if this is a 2FA requirement
        if (userError.message?.includes('More factors are required') || userError.type === 'user_more_factors_required') {
          setRequires2FA(true);
          // Create 2FA challenge
          const challenge = await account.createMfaChallenge('email');
          setTwoFactorChallenge(challenge.$id);
          throw new Error('2FA_REQUIRED');
        }
        throw userError;
      }
    } catch (error: any) {
      // Re-throw 2FA requirement
      if (error.message === '2FA_REQUIRED') {
        throw error;
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create('unique()', email, password, name);
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Send verification email after registration
      setRequiresEmailVerification(true);
      await sendEmailVerification();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setRequiresEmailVerification(false);
      setRequires2FA(false);
      setTwoFactorChallenge(null);
    } catch (error: any) {
      // If MFA is required, set the appropriate state
      if (error.message?.includes('More factors are required') || error.type === 'user_more_factors_required') {
        setRequires2FA(true);
        try {
          const challenge = await account.createMfaChallenge('email');
          setTwoFactorChallenge(challenge.$id);
        } catch (challengeError) {
          console.error('Failed to create MFA challenge:', challengeError);
        }
      } else {
        setUser(null);
      }
      throw error;
    }
  };

  const sendEmailVerification = async () => {
    try {
      await account.createVerification('http://localhost:5173/verify-email');
    } catch (error) {
      throw error;
    }
  };

  const complete2FAChallenge = async (challengeId: string, code: string) => {
    try {
      await account.updateMfaChallenge(challengeId, code);
      const currentUser = await account.get();
      setUser(currentUser);
      setRequires2FA(false);
      setTwoFactorChallenge(null);
      
      // Check email verification after successful 2FA
      if (!currentUser.emailVerification) {
        setRequiresEmailVerification(true);
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        
        // Check if email verification is required
        if (!currentUser.emailVerification) {
          setRequiresEmailVerification(true);
        }
      } catch (error: any) {
        // Check if MFA is required
        if (error.message?.includes('More factors are required') || error.type === 'user_more_factors_required') {
          setRequires2FA(true);
          try {
            const challenge = await account.createMfaChallenge('email');
            setTwoFactorChallenge(challenge.$id);
          } catch (challengeError) {
            console.error('Failed to create MFA challenge:', challengeError);
            // If we can't create a challenge, user needs to login again
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

  const value = {
    user,
    loading,
    requiresEmailVerification,
    requires2FA,
    twoFactorChallenge,
    login,
    register,
    logout,
    refreshUser,
    sendEmailVerification,
    complete2FAChallenge,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}