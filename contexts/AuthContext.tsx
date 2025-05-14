"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as appwriteLogin,
  logout as appwriteLogout,
  getCurrentUser,
  updateUserSyncPreference,
} from "@/lib/appwrite";
// Use local cookie implementation since cookies-next is missing
const setCookie = (name: string, value: string, options = {}) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; path=/; max-age=2592000`; // 30 days
  }
};

const deleteCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export type User = {
  id: string;
  email: string;
  name?: string;
  syncEnabled?: boolean;
  isAdmin?: boolean;
  twoFactorEnabled?: boolean;
};

export type MFAChallengeInfo = {
  challengeId: string;
  email: string;
};

export type LoginResult = {
  success: boolean;
  user?: User;
  requiresMFA?: boolean;
  mfaChallenge?: {
    challengeId: string;
    email: string;
  };
  error?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<LoginResult>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserState: (updatedUser: Partial<User>) => void;
  isOffline: boolean;
  isAdmin: boolean; // Add isAdmin to the context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add isAdmin state

  // Helper function to consistently manage the admin cookie
  const manageAdminCookie = (isAdmin: boolean | undefined) => {
    if (isAdmin) {
      setCookie("admin-status", "true", {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    } else {
      deleteCookie("admin-status");
    }
  };

  const updateUserState = (updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      if (prevUser === null) return prevUser;
      const newUser = { ...prevUser, ...updatedUser };

      // Update admin cookie if isAdmin status changes
      if (
        prevUser?.isAdmin !== newUser.isAdmin &&
        newUser.isAdmin !== undefined
      ) {
        manageAdminCookie(newUser.isAdmin);
        setIsAdmin(!!newUser.isAdmin); // Update isAdmin state
      }

      return newUser as User;
    });
  };
  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAdmin(!!currentUser?.isAdmin); // Set isAdmin based on currentUser
      } catch (authError: any) {      // Check for MFA requirement first
        if (
          authError?.message?.includes("More factors are required") ||
          authError?.code === 412
        ) {
          console.log("MFA verification required, redirecting to verification page");
          
          // Set a cookie to indicate MFA is required
          // This will be picked up by our middleware
          document.cookie = "mfa_required=true; path=/; max-age=300; SameSite=Strict";
          
          if (typeof window !== 'undefined' && 
              !window.location.pathname.startsWith('/verify-mfa') &&
              !window.location.pathname.startsWith('/login')) {
            
            // Create a new MFA challenge and redirect directly
            try {
              // Import the MFA handler dynamically
              const appwriteMFA = (await import('@/lib/appwrite-mfa')).default;
              const challenge = await appwriteMFA.createEmailChallenge();
              
              // Hard redirect to the verification page with challenge ID
              window.location.href = `/verify-mfa?challengeId=${challenge.$id}&returnTo=${encodeURIComponent(window.location.pathname)}`;
              return;
            } catch (mfaError) {
              console.error("Failed to create MFA challenge:", mfaError);
              // Still redirect to verification page without challenge ID
              window.location.href = `/verify-mfa?returnTo=${encodeURIComponent(window.location.pathname)}`;
              return;
            }
          }
          // We're already on the verification page, do nothing
        }
        // Handle other error cases
        else if (
          authError?.toString().includes("missing scope (account)") ||
          authError?.toString().includes("Unauthorized") ||
          authError?.code === 401
        ) {
          // User is not authenticated - this is normal for guests
          setUser(null);
          setIsAdmin(false);
        } else {
          console.error("Authentication error:", authError);
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Add a periodic check every minute to ensure auth state is fresh
    const interval = setInterval(() => {
      if (!isOffline) {
        checkAuth();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOffline]);

  // Monitor online/offline status and try to reconnect when back online
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log("[Auth] Network connection restored, refreshing auth state");
      getCurrentUser().then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsAdmin(!!currentUser.isAdmin); // Update isAdmin on reconnect
          manageAdminCookie(currentUser.isAdmin);
        }
      }).catch(err => {
        console.log("[Auth] Error refreshing user after network reconnect:", err);
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log("[Auth] Network connection lost");
    };

    // Check initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean
  ): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      console.log('******************************');
      console.log('*** AUTH CONTEXT - LOGIN STARTED');
      console.log('*** Email:', email);
      console.log('******************************');
      
      // Use our improved MFA handler
      const { handleMfaLogin } = await import('@/lib/mfa-handler');
      console.log('*** MFA handler imported successfully');
      
      // Call the handler
      console.log('*** Calling MFA handler');
      const result = await handleMfaLogin(email, password);
      console.log('*** MFA handler result:', result);
      
      // If login was successful
      if (result.success && result.user) {
        setUser(result.user);
        setIsAdmin(!!result.user?.isAdmin);
        manageAdminCookie(result.user?.isAdmin);
        return result;
      }
        // If MFA is required
      if (result.requiresMFA && result.mfaChallenge) {
        console.log('MFA challenge detected in login, redirecting to verification page');
        console.log('Challenge ID:', result.mfaChallenge.challengeId);
        
        // Set a cookie to indicate MFA is required
        document.cookie = "mfa_required=true; path=/; max-age=300; SameSite=Strict";
        
        // Hard redirect to verify-mfa page
        const url = `/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${result.mfaChallenge.challengeId}`;
        console.log('Redirecting to:', url);
        
        if (typeof window !== 'undefined') {
          // Force a complete page load rather than a client-side navigation
          window.location.replace(url);
        }
      }
      
      // Return the result which includes MFA challenge info if needed
      return result;
    } catch (error: any) {
      console.error('Login error in AuthContext:', error);
      
      // Special handling for MFA-related errors
      if (error.message?.includes('More factors are required')) {
        console.log('MFA challenge detected in login error');
        
        // Set a cookie to indicate MFA is required
        document.cookie = "mfa_required=true; path=/; max-age=300; SameSite=Strict";
        
        try {
          // Try to create a challenge
          const appwriteMFA = (await import('@/lib/appwrite-mfa')).default;
          const challenge = await appwriteMFA.createEmailChallenge();
          
          // Redirect to verification page
          if (typeof window !== 'undefined') {
            window.location.href = `/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challenge.$id}`;
          }
          
          return {
            success: false,
            requiresMFA: true,
            mfaChallenge: {
              challengeId: challenge.$id,
              email
            }
          };
        } catch (challengeError) {
          console.error('Error creating challenge:', challengeError);
          
          // Still redirect
          if (typeof window !== 'undefined') {
            window.location.href = `/verify-mfa?email=${encodeURIComponent(email)}`;
          }
        }
        
        return {
          success: false,
          requiresMFA: true,
          error: error.message
        };
      }
      
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Import the registration service
      const { RegistrationService } = await import('@/lib/registration-service');
      
      // Create a redirect URL for verification
      const verificationRedirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/verify-email` 
        : 'https://gradetracker.app/verify-email';
      
      // Initialize the service and register the user
      const registrationService = new RegistrationService(verificationRedirectUrl);
      const result = await registrationService.registerUser(email, password, name);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Auto-login after registration
      await appwriteLogin(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAdmin(!!currentUser?.isAdmin);
      
      // New users typically aren't admins, but check anyway
      manageAdminCookie(currentUser?.isAdmin);
      
      // Return success with message about verification email
      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    setIsLoading(true);
    try {
      await appwriteLogout();
      setUser(null);
      setIsAdmin(false); // Reset isAdmin on logout
      // Remove admin cookie on logout
      manageAdminCookie(false);
      
      // Force a hard redirect to the login page on logout
      // This ensures any MFA state is completely cleared
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserState,
        isOffline,
        isAdmin, // Expose isAdmin to consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
