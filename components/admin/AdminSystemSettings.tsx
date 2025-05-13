"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, RefreshCw, Shield, Database, Cloud } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function AdminSystemSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [settings, setSettings] = useState({
    appName: "Grade Tracker",
    databaseBackupInterval: "daily",
    dataRetentionPeriod: "365",
    maxUploadSize: "10",
    debugMode: false,
    analyticsEnabled: true,
    registrationOpen: true,
    maintenanceMessage:
      "The system is currently under maintenance. Please check back later.",
  });
  // Track loading state for maintenance settings
  const [isLoadingMaintenanceSettings, setIsLoadingMaintenanceSettings] =
    useState(true);

  // Load initial maintenance settings from server
  useEffect(() => {
    async function loadMaintenanceSettings() {
      try {
        const res = await fetch("/api/admin/maintenance");
        if (res.ok) {
          const data = await res.json();
          setIsMaintenanceMode(data.isMaintenanceMode);
          setSettings((prev) => ({
            ...prev,
            maintenanceMessage: data.maintenanceMessage,
          }));
        } else {
          console.error(
            "Failed to fetch maintenance settings",
            await res.text()
          );
        }
      } catch (err) {
        console.error("Error loading maintenance settings", err);
      } finally {
        setIsLoadingMaintenanceSettings(false);
      }
    }
    loadMaintenanceSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Settings updated",
        description: "System settings have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      // Send update to server
      const newMode = !isMaintenanceMode;
      const payload = {
        isMaintenanceMode: newMode,
        maintenanceMessage: settings.maintenanceMessage,
      };
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Update local state
      setIsMaintenanceMode(data.isMaintenanceMode);
      setSettings((prev) => ({
        ...prev,
        maintenanceMessage: data.maintenanceMessage,
      }));
      toast({
        title: data.isMaintenanceMode
          ? "Maintenance mode enabled"
          : "Maintenance mode disabled",
        description: data.isMaintenanceMode
          ? "The application is now in maintenance mode."
          : "The application is now accessible to all users.",
      });
    } catch (error) {
      console.error("Failed to toggle maintenance mode", error);
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSystemReset = async () => {
    setIsConfirmResetOpen(false);

    toast({
      title: "System reset initiated",
      description: "This process may take several minutes to complete.",
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    toast({
      title: "System reset completed",
      description: "All system caches have been cleared.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure core system settings for the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input
                    id="app-name"
                    value={settings.appName}
                    onChange={(e) =>
                      setSettings({ ...settings, appName: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="backup-interval">
                    Database Backup Interval
                  </Label>
                  <Select
                    defaultValue={settings.databaseBackupInterval}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        databaseBackupInterval: value,
                      })
                    }
                  >
                    <SelectTrigger id="backup-interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="retention-period">
                    Data Retention Period (days)
                  </Label>
                  <Input
                    id="retention-period"
                    type="number"
                    min="30"
                    value={settings.dataRetentionPeriod}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataRetentionPeriod: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max-upload">Maximum Upload Size (MB)</Label>
                  <Input
                    id="max-upload"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxUploadSize}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxUploadSize: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed error messages and logging
                    </p>
                  </div>
                  <Switch
                    id="debug-mode"
                    checked={settings.debugMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, debugMode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Analytics Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymous usage data to improve the application
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, analyticsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="registration">Open Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    id="registration"
                    checked={settings.registrationOpen}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, registrationOpen: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4 pt-4">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the application in maintenance mode, blocking access
                      to regular users
                    </p>
                  </div>
                  <Button
                    variant={isMaintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleMaintenanceToggle}
                    disabled={isLoadingMaintenanceSettings}
                    className="min-w-[120px]"
                  >
                    {isMaintenanceMode ? "Disable" : "Enable"}
                  </Button>
                </div>

                {isMaintenanceMode && (
                  <div className="grid gap-2">
                    <Label htmlFor="maintenance-message">
                      Maintenance Message
                    </Label>
                    <Input
                      id="maintenance-message"
                      value={settings.maintenanceMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maintenanceMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-base font-medium">System Operations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="space-x-2 h-auto py-4"
                      onClick={() => {
                        toast({
                          title: "Cache cleared",
                          description:
                            "System cache has been successfully cleared.",
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">Clear Cache</p>
                        <p className="text-xs text-muted-foreground">
                          Clear application caches
                        </p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="space-x-2 h-auto py-4"
                      onClick={() => {
                        toast({
                          title: "Database backup started",
                          description:
                            "Backup will be available in the admin downloads section.",
                        });
                      }}
                    >
                      <Database className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">Backup Database</p>
                        <p className="text-xs text-muted-foreground">
                          Create a full database backup
                        </p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="space-x-2 h-auto py-4"
                      onClick={() => {
                        toast({
                          title: "Test email sent",
                          description: "Check admin inbox for the test email.",
                        });
                      }}
                    >
                      <Cloud className="h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">Test Email</p>
                        <p className="text-xs text-muted-foreground">
                          Send a test email to verify configuration
                        </p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="space-x-2 h-auto py-4 border-destructive/20 hover:border-destructive"
                      onClick={() => setIsConfirmResetOpen(true)}
                    >
                      <Shield className="h-4 w-4 text-destructive" />
                      <div className="text-left">
                        <p className="font-medium text-destructive">
                          Reset System
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Clear all caches and restart services
                        </p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isConfirmResetOpen}
        onOpenChange={setIsConfirmResetOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all system caches and restart all services. This
              operation cannot be undone and may cause temporary disruption to
              users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSystemReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset System
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
