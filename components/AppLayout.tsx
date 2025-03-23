"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if current route is a public route that shouldn't have a sidebar
  const isPublicRoute =
    pathname === "/landing" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/privacy-policy" ||
    pathname === "/datenschutz" ||
    pathname?.startsWith("/auth/");

  // Determine if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Check on initial load
    checkIfMobile();

    // Listen for resize events
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Memoize the children to prevent unnecessary re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Only show sidebar on desktop for authenticated routes */}
      {!isPublicRoute && !isMobile && <Sidebar />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">{memoizedChildren}</main>
      </div>

      <Toaster />
    </div>
  );
}
