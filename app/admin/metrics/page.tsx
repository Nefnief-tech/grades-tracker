'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, BarChart2, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  endpointStats: Record<string, {
    hits: number;
    errors: number;
    averageResponseTime: number;
  }>;
  lastRequestTimestamp: string;
  systemInfo: {
    environment: string;
    version: string;
    uptime: number | string;
    timestamp: string;
  };
}

export default function ApiMetricsDashboard() {
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [adminKey, setAdminKey] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Load admin key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('admin-key');
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  // Fetch metrics when component mounts or admin key changes
  useEffect(() => {
    if (adminKey) {
      fetchMetrics();
    }
    
    // Set up auto-refresh if enabled
    let refreshInterval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        if (adminKey) fetchMetrics();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [adminKey, autoRefresh]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'X-Admin-Key': adminKey
        }
      });

      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
        setLastUpdated(new Date());
      } else {
        toast({
          title: "Failed to fetch metrics",
          description: result.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching API metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API metrics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMetrics = async () => {
    try {
      setIsResetting(true);
      const response = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({ action: 'reset' })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Metrics Reset",
          description: "API metrics have been reset successfully",
        });
        fetchMetrics();
      } else {
        toast({
          title: "Failed to reset metrics",
          description: result.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting API metrics:', error);
      toast({
        title: "Error",
        description: "Failed to reset API metrics",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      toast({
        title: "Auto-refresh Enabled",
        description: "Dashboard will refresh every 5 seconds",
      });
    }
  };

  // Calculate success rate percentage
  const getSuccessRate = () => {
    if (!metrics || metrics.totalRequests === 0) return 0;
    return Math.round((metrics.successfulRequests / metrics.totalRequests) * 100);
  };

  // Format API endpoints as labels
  const formatEndpoint = (endpoint: string) => {
    return endpoint.split('/').filter(Boolean).join(' / ');
  };

  if (!adminKey) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication Required</CardTitle>
            <CardDescription>
              Please visit the admin maintenance page to set your admin key first.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="/admin/maintenance">Go to Admin Maintenance</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Metrics Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={autoRefresh ? "border-primary text-primary" : ""}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={resetMetrics}
            disabled={isResetting}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reset Metrics
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Requests Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total API Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">
                    {metrics?.totalRequests || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  All-time API calls
                </p>
              </CardContent>
            </Card>

            {/* Success Rate Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {getSuccessRate()}%
                    </div>
                    <Progress 
                      value={getSuccessRate()} 
                      className="h-2 mt-2" 
                    />
                  </>
                )}
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-500">✓</span> Success: {metrics?.successfulRequests || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-destructive">✗</span> Failed: {metrics?.failedRequests || 0}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">
                    {metrics?.averageResponseTime.toFixed(2) || 0}
                    <span className="text-sm font-normal ml-1">ms</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Across all endpoints
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Last Request */}
          <Card>
            <CardHeader>
              <CardTitle>Last Request</CardTitle>
              <CardDescription>
                Details about the most recent API call
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : metrics?.lastRequestTimestamp ? (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Timestamp:</span>{" "}
                    {new Date(metrics.lastRequestTimestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No requests recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>
                Metrics broken down by API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : metrics && Object.keys(metrics.endpointStats).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(metrics.endpointStats).map(([endpoint, stats]) => (
                    <div key={endpoint} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{formatEndpoint(endpoint)}</h3>
                        <Badge variant={stats.errors > 0 ? "destructive" : "outline"}>
                          {stats.errors > 0 ? `${stats.errors} Errors` : "Healthy"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Hits</p>
                          <p className="text-xl font-bold">{stats.hits}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                          <p className="text-xl font-bold">
                            {stats.averageResponseTime.toFixed(2)}
                            <span className="text-sm font-normal ml-1">ms</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <Progress 
                          value={stats.hits > 0 ? ((stats.hits - stats.errors) / stats.hits) * 100 : 0} 
                          className="h-2 mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No endpoint data available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Details about the system environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : metrics?.systemInfo ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Environment</p>
                    <p className="font-medium">
                      {metrics.systemInfo.environment === 'production'
                        ? <Badge variant="default">Production</Badge>
                        : <Badge variant="outline">{metrics.systemInfo.environment}</Badge>
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p>{metrics.systemInfo.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p>{typeof metrics.systemInfo.uptime === 'number'
                        ? `${Math.floor(metrics.systemInfo.uptime / 3600)}h ${Math.floor((metrics.systemInfo.uptime % 3600) / 60)}m ${metrics.systemInfo.uptime % 60}s`
                        : metrics.systemInfo.uptime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Server Time</p>
                    <p>{new Date(metrics.systemInfo.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">System information not available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}