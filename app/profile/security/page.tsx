"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldCheck, Key, LockKeyhole, LogOut } from "lucide-react";
import { getAccount } from "@/lib/appwrite";

export default function SecurityPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
      });
      return;
    }

    setLoading(true);
    try {
      const account = getAccount();
      if (!account) throw new Error("Not authenticated");
      
      await account.updatePassword(newPassword, currentPassword);
      
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Error changing password",
        description: error?.message || "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // Two-factor authentication toggle handler
  const handleToggleTwoFactor = async () => {
    toast({
      title: "Two-factor authentication",
      description: "This feature will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings.
        </p>
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            Password
          </CardTitle>
          <CardDescription>
            Change your account password. We recommend using a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code when signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={() => {
                handleToggleTwoFactor();
              }}
            />
            <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            When enabled, you'll be asked for a verification code when signing in from an unrecognized device.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Sign out from all devices or delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/profile/sessions")}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Manage Sessions
            </Button>
            
            <Button 
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Account deletion",
                  description: "This feature requires confirmation and will be available in account settings.",
                });
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}