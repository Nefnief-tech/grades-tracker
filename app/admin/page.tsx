"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSystemSettings } from "@/components/admin/AdminSystemSettings";
import {
  PieChart,
  BarChart,
  Activity,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalSubjects: 0,
    totalGrades: 0,
    averageGpa: 0,
    uptimeSeconds: 0,
    totalMem: 0,
    freeMem: 0,
    githubStars: null,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.isAdmin) {
      router.push("/");
      return;
    }
    // Fetch summary data
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/summary");
        const data = await res.json();
        setSummaryData((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, router, authLoading]);

  // Show loading state when auth is still loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // We only reach this code if authLoading is false
  if (!user || !user.isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Only render the admin dashboard if we have a user and they are an admin
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage application settings, users, and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Admin Access
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {summaryData.activeUsers} active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalGrades}</div>
            <p className="text-xs text-muted-foreground">
              Across {summaryData.totalSubjects} subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.averageGpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(summaryData.uptimeSeconds / 3600)}h{" "}
              {Math.floor((summaryData.uptimeSeconds % 3600) / 60)}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              {(
                (summaryData.totalMem - summaryData.freeMem) /
                (1024 * 1024)
              ).toFixed(1)}{" "}
              / {(summaryData.totalMem / (1024 * 1024)).toFixed(1)}MB
            </div>
          </CardContent>
        </Card>

        {summaryData.githubStars != null && (
          <Card>
            <CardHeader>
              <CardTitle>GitHub Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.githubStars}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <PieChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdminSystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
