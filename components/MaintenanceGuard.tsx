"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  X,
  LineChart,
  Settings,
  RefreshCw,
  BookOpen,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MaintenanceSettings = {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
};

export default function MaintenanceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user was previously authenticated in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authenticated =
        sessionStorage.getItem("maintenanceAuthenticated") === "true";
      setIsAuthenticated(authenticated);
    }
  }, []);

  // Function to handle password authentication
  const handleAuthentication = () => {
    setIsAuthenticating(true);

    // Simple authentication - in a real app, you would validate against a secure API
    // Using a dedicated maintenance password from env or fallback to default
    const adminPassword =
      process.env.NEXT_PUBLIC_MAINTENANCE_PASSWORD || "admin123";

    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("maintenanceAuthenticated", "true");

      // Disable FORCE_LOCAL_MODE to allow Appwrite sync during maintenance
      try {
        // Import dynamically to avoid circular dependencies
        import("@/lib/appwrite").then((appwrite) => {
          // Set FORCE_LOCAL_MODE to false to enable cloud sync
          appwrite.FORCE_LOCAL_MODE = false;
          console.log(
            "[MaintenanceGuard] Disabled FORCE_LOCAL_MODE to allow cloud sync"
          );
        });
      } catch (error) {
        console.error("Failed to disable local mode:", error);
      }
    } else {
      // Show error toast
      alert("Invalid password");
    }

    setIsAuthenticating(false);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuthentication();
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/maintenance", {
          cache: "no-cache", // Don't cache this request
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!res.ok) {
          throw new Error(
            `Failed to fetch maintenance settings: ${res.status}`
          );
        }

        const data = await res.json();
        console.log("Maintenance settings:", data);
        setSettings(data);
      } catch (err) {
        console.error("Failed to load maintenance settings", err);
        // Set fallback settings
        setSettings({
          isMaintenanceMode: false,
          maintenanceMessage: "Maintenance",
        });
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchSettings();

    // Refresh every minute to catch changes
    const interval = setInterval(fetchSettings, 60000);

    return () => clearInterval(interval);
  }, []);

  // Helper: is admin - safely check for admin status
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_ID;

  // Handle loading states gracefully
  if (authLoading || loading) {
    // Show children while loading to avoid flash of maintenance page
    return <>{children}</>;
  }

  // If not in maintenance mode, show normal content
  if (!settings?.isMaintenanceMode) {
    return <>{children}</>;
  }

  // If admin or authenticated, always show content with banner
  if (isAdmin || isAuthenticated) {
    return <>{children}</>;
  }

  // Block / and /register with a full maintenance page
  if (pathname === "/" || pathname === "/register") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="w-full max-w-md bg-background border rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="mb-4 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <BookOpen size={64} strokeWidth={1.5} />
            </div>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-muted-foreground">
              System Maintenance
            </span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            We'll be back soon!
          </h1>

          <p className="text-muted-foreground text-lg">
            {settings?.maintenanceMessage ||
              "Our system is currently undergoing scheduled maintenance to improve your experience."}
          </p>

          {/* Password authentication section */}
          <div className="mt-6 border-t border-muted pt-6">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter admin password"
                      className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter admin password to bypass maintenance mode
                </p>
              </div>
              <Button
                onClick={handleAuthentication}
                disabled={isAuthenticating || !password.trim()}
                className="w-full"
              >
                {isAuthenticating ? "Authenticating..." : "Authenticate"}
              </Button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Link href="/admin" className="inline-block">
              <Button variant="default" size="lg" className="gap-2 w-full">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Grade Tracker. All rights reserved.
        </p>
      </div>
    );
  }

  // Show a shadcn/ui Alert at the top for all other routes (except /admin)
  // If authenticated or dismissed, just show the children
  if (isAuthenticated || dismissed) return <>{children}</>;

  return (
    <>
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-2 pointer-events-auto"
        style={{ pointerEvents: "auto" }}
      >
        <Alert
          variant="destructive"
          className="rounded-md shadow-md px-4 py-3 flex items-center gap-3 border bg-background relative"
        >
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <AlertTitle className="font-semibold">Maintenance Mode</AlertTitle>
            <AlertDescription>
              {settings.maintenanceMessage ||
                "The system is currently under maintenance."}
              <div className="mt-1 text-xs text-muted-foreground">
                Maintenance mode is saved in the cloud and affects all users
                instantly.
              </div>
            </AlertDescription>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close maintenance alert"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      </div>
      {children}
    </>
  );
}
