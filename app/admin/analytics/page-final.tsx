'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Eye, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Database,
  Shield,
  BarChart3,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

// Hardcoded admin user ID - replace with proper auth when ready
const ADMIN_USER_ID = '67d6f7fe0019adf0fd95';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeSessions: number;
    pageViews: number;
    errorRate: number;
    avgLoadTime: number;
    bounceRate: number;
  };
  timeSeriesData: any[];
  topPages: any[];
  userActivity: any[];
  deviceStats: any[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate loading analytics data
  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data - replace with real API call
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1234,
          activeSessions: 87,
          pageViews: 5678,
          errorRate: 0.1,
          avgLoadTime: 1.2,
          bounceRate: 23.5
        },
        timeSeriesData: [],
        topPages: [
          { path: '/dashboard', views: 1234, percentage: 35 },
          { path: '/grades', views: 987, percentage: 28 },
          { path: '/subjects', views: 654, percentage: 18 },
          { path: '/analytics', views: 321, percentage: 9 },
          { path: '/settings', views: 234, percentage: 7 }
        ],
        userActivity: [
          { action: 'User Login', user: 'john@example.com', time: '2 min ago' },
          { action: 'Grade Added', user: 'jane@example.com', time: '5 min ago' },
          { action: 'Subject Created', user: 'bob@example.com', time: '8 min ago' },
          { action: 'Page View', user: 'alice@example.com', time: '12 min ago' }
        ],
        deviceStats: [
          { device: 'Desktop', count: 456, percentage: 65 },
          { device: 'Mobile', count: 234, percentage: 33 },
          { device: 'Tablet', count: 14, percentage: 2 }
        ]
      };
      
      setAnalytics(mockData);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor your application's performance and user activity
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Badge variant="secondary" className="w-fit">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Time Range:
                </span>
              </div>
              
              <div className="flex gap-2">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={timeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Error Loading Analytics</p>
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadAnalytics} className="ml-auto">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '---' : analytics?.overview.totalUsers.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    +12% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '---' : analytics?.overview.activeSessions.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Currently online
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? '---' : analytics?.overview.pageViews.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    +8% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '---' : `${analytics?.overview.errorRate || 0}%`}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    -0.2% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '---' : `${analytics?.overview.avgLoadTime || 0}s`}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    -0.3s from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {loading ? '---' : `${analytics?.overview.bounceRate || 0}%`}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    -2.1% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Overview
                </CardTitle>
                <CardDescription>
                  Detailed charts and graphs will be displayed here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                  <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Charts Coming Soon
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Time range: {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>Latest user actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      analytics?.userActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {activity.action}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {activity.user}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {activity.time}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Statistics</CardTitle>
                  <CardDescription>User device breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      analytics?.deviceStats.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {device.device}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${device.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                              {device.percentage}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages in your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    analytics?.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {page.path}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {page.views.toLocaleString()} views
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {page.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Configuration
                </CardTitle>
                <CardDescription>
                  Analytics database setup and connection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Database ID</h4>
                    <code className="block text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      67d6b079002144822b5e
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Admin User ID</h4>
                    <code className="block text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      {ADMIN_USER_ID}
                    </code>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Next Steps</h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Complete database setup using the manual guide
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <Link href="/debug-analytics" className="underline hover:text-slate-900 dark:hover:text-slate-100">
                        Test database connection
                      </Link>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Verify all collections and attributes
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Analytics dashboard is ready for real data
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}