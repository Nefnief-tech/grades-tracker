"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertCircle,
  User,
  Settings,
  Save,
  LogOut,
  UserX,
  Upload,
  Download,
  Trash2,
  FileDown,
  Eye,
  GraduationCap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { user, updateUserState, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState("");

  // App settings
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const [gradeSystem, setGradeSystem] = useState("german");
  const [displayDecimals, setDisplayDecimals] = useState(1);
  const [autoBackup, setAutoBackup] = useState(false);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // In a real app, call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update user state in context
      updateUserState({ name: displayName });

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);

    toast({
      title: "Avatar uploaded",
      description: "Your profile picture has been updated.",
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setDarkMode(newTheme === "dark");
  };

  // Handle settings save
  const saveSettings = () => {
    localStorage.setItem(
      "userSettings",
      JSON.stringify({
        gradeSystem,
        displayDecimals,
        autoBackup,
      })
    );

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  // Export data function
  const handleExportData = () => {
    try {
      // Get data from localStorage
      const subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
      const tests = JSON.parse(localStorage.getItem("tests") || "[]");

      // Create combined data object
      const exportData = {
        subjects,
        tests,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      // Create file content
      const fileContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([fileContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      const fileName = `grades_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If no user is logged in
  if (!user) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user.name || "User"} />
            ) : (
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-semibold">{user.name || "User"}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 md:grid-cols-4 sm:inline-flex mb-4">
          <TabsTrigger value="profile" className="flex gap-2 items-center">
            <User className="h-4 w-4 hidden sm:block" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex gap-2 items-center">
            <Eye className="h-4 w-4 hidden sm:block" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex gap-2 items-center">
            <GraduationCap className="h-4 w-4 hidden sm:block" />
            <span>Academic</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex gap-2 items-center">
            <FileDown className="h-4 w-4 hidden sm:block" />
            <span>Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt={user.name || "User"}
                          />
                        ) : (
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {user.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <Label htmlFor="avatar-upload" className="mb-2 block">
                          Upload profile picture
                        </Label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Management options for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Account Status</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => logout()}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete your account? This cannot be undone."
                      )
                    ) {
                      // Handle delete account
                    }
                  }}
                  disabled={isLoading}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the application appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Appearance Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Academic Settings Tab */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Settings
              </CardTitle>
              <CardDescription>
                Configure grade system and academic preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="grade-system">Grading system</Label>
                <Select value={gradeSystem} onValueChange={setGradeSystem}>
                  <SelectTrigger id="grade-system">
                    <SelectValue placeholder="Select grading system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="german">
                      German (1-6, 1 is best)
                    </SelectItem>
                    <SelectItem value="us">
                      American (A-F, A is best)
                    </SelectItem>
                    <SelectItem value="percentage">
                      Percentage (0-100%, 100% is best)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-decimals">Grade decimal places</Label>
                <Select
                  value={displayDecimals.toString()}
                  onValueChange={(v) => setDisplayDecimals(parseInt(v))}
                >
                  <SelectTrigger id="display-decimals">
                    <SelectValue placeholder="Select decimal places" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No decimals (e.g., 2)</SelectItem>
                    <SelectItem value="1">One decimal (e.g., 2.0)</SelectItem>
                    <SelectItem value="2">Two decimals (e.g., 2.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Academic Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export, import or back up your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">Automatic backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Create backups every week
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to clear all data? This cannot be undone."
                      )
                    ) {
                      localStorage.removeItem("subjects");
                      localStorage.removeItem("tests");
                      toast({
                        title: "Data cleared",
                        description:
                          "All local data has been cleared successfully.",
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Local Data
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Data Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
