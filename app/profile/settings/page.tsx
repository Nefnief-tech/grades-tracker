"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { AccountForm } from "@/components/forms/AccountForm";
import { NotificationsForm } from "@/components/forms/NotificationsForm";
import { DisplayForm } from "@/components/forms/DisplayForm";
import { TwoFactorToggle } from "@/components/TwoFactorToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  
  // Only render client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6">
        <AccountForm />
        
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TwoFactorToggle />
          </CardContent>
        </Card>
        
        <NotificationsForm />
        <DisplayForm />
      </div>
    </div>
  );
}