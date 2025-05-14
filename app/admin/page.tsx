'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { UserManagement } from '@/components/admin/UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, Settings, PieChart, BookOpen, Bell, Activity,
  Database, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect non-admin users
    if (!isLoading && mounted && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAdmin, router, mounted]);

  // Show loading state
  if (isLoading || !mounted) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-6 w-1/3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          
          <Skeleton className="h-[500px] mt-6" />
        </div>
      </div>
    );
  }

  // Prevent unauthorized access
  if (!isAdmin) {
    return null;
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container max-w-7xl py-6">
        <div className="space-y-0.5 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your application, users, and system settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DashboardCard 
            title="Total Users" 
            value="356" 
            description="12% increase this month"
            icon={<Users className="h-5 w-5" />}
            trend="increase"
          />
          
          <DashboardCard 
            title="Active Quizzes" 
            value="125" 
            description="3 new quizzes today"
            icon={<BookOpen className="h-5 w-5" />}
            trend="neutral"
          />
          
          <DashboardCard 
            title="System Status" 
            value="Operational" 
            description="All systems running normally"
            icon={<Activity className="h-5 w-5" />}
            trend="positive"
            valueColor="text-green-600"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-10 bg-background pb-4 border-b">
            <TabsList className="bg-background h-auto p-0 flex flex-nowrap overflow-x-auto scrollbar-hide">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <PieChart className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <Database className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-muted"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <h3 className="text-xl font-semibold">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent activities to display.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current status of the application</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">All systems operational</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <h3 className="text-xl font-semibold">Content Management</h3>
            <p className="text-muted-foreground">Manage quizzes, questions, and educational content.</p>
            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>Manage and organize educational content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Content management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <h3 className="text-xl font-semibold">Security Settings</h3>
            <p className="text-muted-foreground">Manage security settings, access controls, and permissions.</p>
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Manage roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Security management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <h3 className="text-xl font-semibold">Notification Center</h3>
            <p className="text-muted-foreground">Manage and send notifications to users.</p>
            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Create and manage system announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Notification features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-xl font-semibold">System Settings</h3>
            <p className="text-muted-foreground">Configure application settings and preferences.</p>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure application behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Settings management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

function DashboardCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  valueColor = "text-foreground"
}: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: "increase" | "decrease" | "neutral" | "positive";
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="p-2 bg-muted rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
