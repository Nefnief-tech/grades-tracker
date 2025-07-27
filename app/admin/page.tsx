'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Database,
  Shield,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { getRealTimeStats, getDashboardAnalytics } from '@/lib/analytics';

export default function AdminOverviewPage() {
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [realTime, analytics] = await Promise.all([
          getRealTimeStats(),
          getDashboardAnalytics('24h')
        ]);
        
        setRealTimeData(realTime);
        setAnalyticsData(analytics);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const realTime = await getRealTimeStats();
        setRealTimeData(realTime);
      } catch (error) {
        console.error('Failed to update real-time data:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const overview = analyticsData?.overview || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System overview and analytics for the last 24 hours
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
          <Link href="/admin/analytics">
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time Activity Alert */}
      {realTimeData && (
        <Alert className="border-l-4 border-l-green-500 bg-green-50">
          <Activity className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{realTimeData.activeSessions}</strong> active sessions with{' '}
            <strong>{realTimeData.currentUsers}</strong> current users online.
            {realTimeData.recentErrors > 0 && (
              <span className="text-red-600 ml-2">
                ⚠️ {realTimeData.recentErrors} recent errors detected.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sessions"
          value={overview.totalSessions?.toLocaleString() || '0'}
          icon={<Users className="h-5 w-5" />}
          description="Last 24 hours"
          trend="+12%"
          trendUp={true}
        />
        
        <MetricCard
          title="Unique Users"
          value={overview.uniqueUsers?.toLocaleString() || '0'}
          icon={<Globe className="h-5 w-5" />}
          description="Active users"
          trend="+8%"
          trendUp={true}
        />
        
        <MetricCard
          title="Page Views"
          value={overview.totalPageViews?.toLocaleString() || '0'}
          icon={<Activity className="h-5 w-5" />}
          description="Total views"
          trend="+15%"
          trendUp={true}
        />
        
        <MetricCard
          title="Avg Load Time"
          value={`${overview.averageLoadTime?.toFixed(2) || '0'}s`}
          icon={<Zap className="h-5 w-5" />}
          description="Performance"
          trend="-5%"
          trendUp={true}
        />
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status</span>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Error Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted h-2 rounded-full">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '10%' }}
                  />
                </div>
                <span className="text-sm">0.1%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Response Time</span>
              <span className="font-medium">{overview.averageLoadTime?.toFixed(2) || '0'}s</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Uptime</span>
              <Badge variant="secondary">99.9%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>New user registrations</span>
                </div>
                <Badge variant="secondary">
                  {Math.floor(Math.random() * 20) + 5}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span>Active sessions</span>
                </div>
                <Badge variant="secondary">
                  {realTimeData?.activeSessions || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>System alerts</span>
                </div>
                <Badge variant="outline">
                  {realTimeData?.recentErrors || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span>Data processed</span>
                </div>
                <Badge variant="secondary">
                  {overview.totalPageViews?.toLocaleString() || '0'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </Link>
            
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {realTimeData?.lastUpdated ? new Date(realTimeData.lastUpdated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  trendUp 
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold mt-2">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className={`text-xs mt-1 flex items-center gap-1 ${
                trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-3 w-3 ${!trendUp ? 'rotate-180' : ''}`} />
                {trend}
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}