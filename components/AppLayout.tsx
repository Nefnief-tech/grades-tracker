"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Close mobile sidebar when path changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Memoize the children to prevent unnecessary re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);

  // Toggle the mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - only visible on desktop */}
      {!isPublicRoute && !isMobile && <Sidebar />}

      {/* Mobile Sidebar - conditionally rendered based on isMobileSidebarOpen */}
      {!isPublicRoute && isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
        >
          <div
            className="absolute left-0 top-0 h-full w-[75%] max-w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - only visible on mobile */}
        {!isPublicRoute && isMobile && (
          <MobileHeader onMenuClick={toggleMobileSidebar} />
        )}

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">{memoizedChildren}</main>
      </div>

      <Toaster />
    </div>
  );
}
