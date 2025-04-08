"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  updateUserSyncPreference,
  deleteAccount,
  deleteAllCloudData,
} from "@/lib/appwrite";
import { clearAllGradesData } from "@/utils/storageUtils";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CloudOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle,
  Cloud,
  Download,
  Info,
  Trash2,
  Upload,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const { user, isLoading, logout, updateUserState } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [updatingSyncSetting, setUpdatingSyncSetting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isDeletingCloudData, setIsDeletingCloudData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCloudConfirmOpen, setDeleteCloudConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setSyncEnabled(user.syncEnabled || false);
    }
  }, [user]);

  const handleSyncToggle = async () => {
    if (!user?.id) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to change sync settings",
        variant: "destructive",
      });
      return;
    }

    setUpdatingSyncSetting(true);
    try {
      await updateUserSyncPreference(user.id, !syncEnabled);

      // Update local state
      setSyncEnabled(!syncEnabled);

      // Update auth context
      if (updateUserState) {
        updateUserState({
          ...user,
          syncEnabled: !syncEnabled,
        });
      }

      // Dispatch an event to notify components to refresh data
      window.dispatchEvent(new Event("syncPreferenceChanged"));

      toast({
        title: "Settings updated",
        description: `Cloud sync is now ${
          !syncEnabled ? "enabled" : "disabled"
        }`,
      });
    } catch (error) {
      console.error("Failed to update sync setting:", error);
      toast({
        title: "Failed to update settings",
        description: "There was an error updating your sync preferences",
        variant: "destructive",
      });
    } finally {
      setUpdatingSyncSetting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleClearData = () => {
    setIsDeletingData(true);
    try {
      clearAllGradesData();
      toast({
        title: "Data cleared",
        description: "All your local data has been cleared",
      });

      // Dispatch an event to notify components to refresh data
      window.dispatchEvent(new Event("syncPreferenceChanged"));
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast({
        title: "Failed to clear data",
        description: "There was an error clearing your data",
        variant: "destructive",
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount(user.id);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
      router.push("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast({
        title: "Failed to delete account",
        description:
          "There was an error deleting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleDeleteCloudData = async () => {
    if (!user?.id) return;

    setIsDeletingCloudData(true);
    try {
      await deleteAllCloudData(user.id);

      // Update sync setting to false since there's no more cloud data
      if (syncEnabled) {
        await updateUserSyncPreference(user.id, false);
        setSyncEnabled(false);
        if (updateUserState) {
          updateUserState({
            ...user,
            syncEnabled: false,
          });
        }
      }

      toast({
        title: "Cloud data deleted",
        description:
          "All your cloud data has been permanently deleted. Your account remains active.",
      });

      // Dispatch an event to notify components to refresh data
      window.dispatchEvent(new Event("syncPreferenceChanged"));
    } catch (error) {
      console.error("Failed to delete cloud data:", error);
      toast({
        title: "Failed to delete cloud data",
        description:
          "There was an error deleting your cloud data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCloudData(false);
      setDeleteCloudConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarInset className="w-full">
        <div className="w-full">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-screen flex items-center justify-center">
              <p>Loading settings...</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to access settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarInset className="w-full">
      <div className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Settings
          </h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <CardTitle>Cloud Synchronization</CardTitle>
                </div>
                <CardDescription>
                  Manage how your data is stored and synchronized across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-toggle">Enable Cloud Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync your grades across all your devices
                    </p>
                  </div>
                  <Switch
                    id="sync-toggle"
                    checked={syncEnabled}
                    onCheckedChange={handleSyncToggle}
                    disabled={updatingSyncSetting}
                  />
                </div>

                <Separator className="my-4" />

                {syncEnabled ? (
                  <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-green-800 dark:text-green-300 text-sm">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Cloud sync is enabled</h3>
                        <p className="mt-1">
                          Your data is being synchronized across all your
                          devices. The last sync was{" "}
                          {localStorage.getItem("lastSyncTimestamp")
                            ? new Date(
                                localStorage.getItem("lastSyncTimestamp")!
                              ).toLocaleString()
                            : "never"}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-4 text-yellow-800 dark:text-yellow-300 text-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Local storage only</h3>
                        <p className="mt-1">
                          Your data is stored only on this device. Enable cloud
                          sync to access your grades on multiple devices.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    disabled={!syncEnabled}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Force Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    disabled={!syncEnabled}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Force Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your grade data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Clear Local Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Remove all locally stored grades and subjects. This
                        cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleClearData}
                      disabled={isDeletingData}
                    >
                      {isDeletingData ? "Clearing..." : "Clear Local Data"}
                    </Button>
                  </div>

                  {user && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <CloudOff className="h-4 w-4" />
                          Delete Cloud Data
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Delete all your data stored in the cloud while keeping
                          your account. This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteCloudConfirmOpen(true)}
                        disabled={isDeletingCloudData || !syncEnabled}
                        className="flex gap-2 items-center"
                      >
                        <CloudOff className="h-4 w-4" />
                        {isDeletingCloudData
                          ? "Deleting Cloud Data..."
                          : "Delete All Cloud Data"}
                      </Button>
                      {!syncEnabled && user && (
                        <p className="text-xs text-muted-foreground">
                          Cloud sync is currently disabled. Enable it to manage
                          cloud data.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  {user.name && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Name:</span>
                      <span>{user.name}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "Deleting..." : "Delete Account"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently erase all your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteCloudConfirmOpen}
        onOpenChange={setDeleteCloudConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cloud Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all your cloud data? This will
              remove all subjects and grades stored in the cloud, but keep your
              account active. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCloudData}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCloudData}
              disabled={isDeletingCloudData}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingCloudData ? "Deleting..." : "Delete Cloud Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
