"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load maintenance settings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (
    settings?.isMaintenanceMode &&
    user?.id !== process.env.NEXT_PUBLIC_ADMIN_ID
  ) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-lg text-muted-foreground">
            {settings.maintenanceMessage}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
