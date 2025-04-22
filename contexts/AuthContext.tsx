"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createAccount,
  login as appwriteLogin,
  logout as appwriteLogout,
  getCurrentUser,
  updateUserSyncPreference,
} from "@/lib/appwrite";
import { setCookie, deleteCookie } from "cookies-next"; // Import cookie functions

export type User = {
  id: string;
  email: string;
  name?: string;
  syncEnabled?: boolean;
  isAdmin?: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserState: (updatedUser: Partial<User>) => void;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState(false);

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
        setIsAdmin(currentUser?.isAdmin || false);
      } catch (error) {
        // Handle specific error cases
        if (
          error.toString().includes("missing scope (account)") ||
          error.toString().includes("Unauthorized") ||
          error.code === 401
        ) {
          // User is not authenticated - this is normal for guests
          setUser(null);
          setIsAdmin(false);
        } else {
          console.error("Authentication error:", error);
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
          manageAdminCookie(currentUser.isAdmin);
        }
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
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => {
    setIsLoading(true);
    try {
      await appwriteLogin(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // Set admin cookie if the user is an admin
      manageAdminCookie(currentUser?.isAdmin);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await createAccount(email, password, name);
      await appwriteLogin(email, password); // Auto-login after registration
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // New users typically aren't admins, but check anyway
      manageAdminCookie(currentUser?.isAdmin);
    } catch (error) {
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
      // Remove admin cookie on logout
      manageAdminCookie(false);
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
