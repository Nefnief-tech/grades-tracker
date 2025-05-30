'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Trash2, AlertTriangle, Key } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SystemStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    api: {
      status: string;
      responseTime: string;
    };
    database: {
      status: string;
      responseTime: string;
    };
    storage: {
      status: string;
      usage: string;
    };
  };
  maintenance: {
    scheduled: boolean;
    nextMaintenance: string | null;
  };
}

export default function AdminMaintenancePage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [adminKey, setAdminKey] = useState<string>('');
  const [showKeyDialog, setShowKeyDialog] = useState<boolean>(false);
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);

  // Load the admin key from local storage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('admin-key');
    if (savedKey) {
      setAdminKey(savedKey);
      fetchSystemStatus(savedKey);
    } else {
      setShowKeyDialog(true);
      setIsLoading(false);
    }
  }, []);

  // Fetch system status from the maintenance API
  const fetchSystemStatus = async (key: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/maintenance', {
        headers: {
          'X-Admin-Key': key
        }
      });

      const data = await response.json();

      if (data.success) {
        setSystemStatus(data.data);
        toast({
          title: "System status loaded",
          description: "Successfully retrieved system status",
        });
      } else {
        toast({
          title: "Failed to load system status",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin key submission
  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim()) {
      localStorage.setItem('admin-key', adminKey);
      setShowKeyDialog(false);
      fetchSystemStatus(adminKey);
    }
  };

  // Perform maintenance actions
  const performAction = async (action: string) => {
    if (!adminKey) {
      setShowKeyDialog(true);
      return;
    }

    try {
      setIsPerformingAction(true);
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Action Successful",
          description: data.message || `${action} completed successfully`,
        });
        
        // Refresh system status after action
        fetchSystemStatus(adminKey);
      } else {
        toast({
          title: "Action Failed",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to perform ${action}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsPerformingAction(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">System Maintenance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {systemStatus && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>System Status</CardTitle>
                <Badge variant={systemStatus.status === 'operational' ? 'default' : 'destructive'}>
                  {systemStatus.status === 'operational' ? 'Operational' : 'Maintenance'}
                </Badge>
              </div>
              <CardDescription>Current system health and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p>{systemStatus.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <p>{systemStatus.environment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{new Date(systemStatus.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Services</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span>API</span>
                    <Badge variant={systemStatus.services.api.status === 'healthy' ? 'outline' : 'destructive'}>
                      {systemStatus.services.api.status} ({systemStatus.services.api.responseTime})
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span>Database</span>
                    <Badge variant={systemStatus.services.database.status === 'healthy' ? 'outline' : 'destructive'}>
                      {systemStatus.services.database.status} ({systemStatus.services.database.responseTime})
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span>Storage</span>
                    <Badge variant={systemStatus.services.storage.status === 'healthy' ? 'outline' : 'destructive'}>
                      {systemStatus.services.storage.status} ({systemStatus.services.storage.usage})
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fetchSystemStatus(adminKey)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Actions</CardTitle>
              <CardDescription>Perform system maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => performAction('clearCache')}
                disabled={isPerformingAction}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Clear System Cache
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => performAction('resetDemoData')}
                disabled={isPerformingAction}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Reset Demo Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => performAction('toggleMaintenanceMode')}
                disabled={isPerformingAction}
              >
                <AlertTriangle className="h-4 w-4 mr-2" /> Toggle Maintenance Mode
              </Button>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowKeyDialog(true)}
              >
                <Key className="h-4 w-4 mr-2" /> Change Admin Key
              </Button>
            </CardFooter>
          </Card>

          {!systemStatus && !isLoading && !showKeyDialog && (
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>Could not load system status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please check your admin key and try again, or refresh the page.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fetchSystemStatus(adminKey)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Admin Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Authorization</DialogTitle>
            <DialogDescription>
              Please enter your admin key to access maintenance functions.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleKeySubmit} className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              autoComplete="off"
            />
            
            <DialogFooter>
              <Button type="submit" disabled={!adminKey.trim()}>
                Save Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}