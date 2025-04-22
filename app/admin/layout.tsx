"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admin users after auth check completes
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authorization...</span>
      </div>
    );
  }

  // If user is admin, show admin interface
  if (user?.isAdmin) {
    return <>{children}</>;
  }

  // For non-admins (should redirect, but just in case)
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-2">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}
