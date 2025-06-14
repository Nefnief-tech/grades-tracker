'use client';

import { useState, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Smartphone, Laptop, Globe, UserCheck } from "lucide-react";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrentSession: boolean;
}

export function SessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for sessions
  useEffect(() => {
    // In a real app, fetch this from the API
    const mockSessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'London, United Kingdom',
        ip: '192.168.1.1',
        lastActive: 'Just now',
        isCurrentSession: true,
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Paris, France',
        ip: '192.168.1.2',
        lastActive: 'Yesterday',
        isCurrentSession: false,
      },
      {
        id: '3',
        device: 'Firefox on MacOS',
        location: 'New York, USA',
        ip: '192.168.1.3',
        lastActive: '3 days ago',
        isCurrentSession: false,
      },
    ];
    
    setSessions(mockSessions);
    setLoading(false);
  }, []);

  const handleLogoutSession = (sessionId: string) => {
    // In a real app, call the API to terminate the session
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  const handleLogoutAllSessions = () => {
    // In a real app, call the API to terminate all sessions except the current one
    setSessions(sessions.filter(session => session.isCurrentSession));
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    return <Laptop className="h-5 w-5 text-muted-foreground" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading sessions...</div>;

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Globe, Monitor, RefreshCw, Smartphone, Trash2, Laptop, Tablet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAccount } from '@/lib/appwrite';

// Define our session type to match Appwrite's response
interface AppwriteSession {
  $id: string;
  userId: string;
  provider: string;
  providerUid: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: string; // Note: This is a string from Appwrite, not a number
  providerRefreshToken: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  clientEngine: string;
  clientEngineVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
}

export function SessionsManager() {
  const [sessions, setSessions] = useState<AppwriteSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get account instance
      const account = getAccount();
      
      // Fetch sessions from Appwrite
      const response = await account.listSessions();
      setSessions(response.sessions as AppwriteSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load active sessions');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load active sessions"
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    
    try {
      const account = getAccount();
      await account.deleteSession(sessionId);
      
      setSessions(prev => prev.filter(session => session.$id !== sessionId));
      
      toast({
        title: "Session terminated",
        description: "The session has been successfully terminated",
      });
      
      // Redirect to login if current session was terminated
      const terminatedSession = sessions.find(s => s.$id === sessionId);
      if (terminatedSession?.current) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to terminate session"
      });
    } finally {
      setTerminating(null);
    }
  };
  
  const terminateAllOtherSessions = async () => {
    setLoading(true);
    
    try {
      const account = getAccount();
      
      // Get current session ID
      const currentSessionId = sessions.find(s => s.current)?.$id;
      
      if (!currentSessionId) {
        throw new Error('Current session not found');
      }
      
      // Delete all sessions except current
      const promises = sessions
        .filter(session => !session.current)
        .map(session => account.deleteSession(session.$id));
      
      await Promise.all(promises);
      
      // Update sessions list to only include current session
      setSessions(prev => prev.filter(session => session.current));
      
      toast({
        title: "All other sessions terminated",
        description: "All sessions except the current one have been terminated",
      });
    } catch (error) {
      console.error('Error terminating other sessions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to terminate other sessions"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get device icon based on client type
  const getDeviceIcon = (session: AppwriteSession) => {
    const clientType = session.clientType?.toLowerCase() || '';
    const osName = session.osName?.toLowerCase() || '';
    
    if (clientType.includes('mobile') || osName.includes('android') || osName.includes('ios')) {
      return <Smartphone className="h-8 w-8 text-muted-foreground" />;
    } else if (clientType.includes('tablet')) {
      return <Tablet className="h-8 w-8 text-muted-foreground" />;
    } else if (clientType.includes('desktop')) {
      return <Laptop className="h-8 w-8 text-muted-foreground" />;
    } else {
      return <Globe className="h-8 w-8 text-muted-foreground" />;
    }
  };
  
  // Format relative time from timestamp string
  const formatRelativeTime = (timestampStr: string) => {
    // Convert string timestamp to number (it's either a timestamp or a date string)
    const timestamp = isNaN(Number(timestampStr)) 
      ? new Date(timestampStr).getTime() / 1000 
      : Number(timestampStr);
    
    const now = Date.now() / 1000; // in seconds
    const diff = now - timestamp; 
    
    const seconds = Math.floor(diff);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    return 'Just now';
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load sessions</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading your active sessions.
            </p>
            <Button onClick={fetchSessions} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            These are the devices that are currently logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getDeviceIcon(session.device)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.device}</p>
                    {session.isCurrentSession && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span>{session.location} ({session.ip})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last active: {session.lastActive}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={session.isCurrentSession}
                onClick={() => handleLogoutSession(session.id)}
              >
                {session.isCurrentSession ? 'Current' : 'Logout'}
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleLogoutAllSessions}>
            Logout from all other devices
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Security</CardTitle>
          <CardDescription>
            Additional settings to enhance your account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Session Timeout</div>
              <div className="text-sm text-muted-foreground">
                Automatically log out after a period of inactivity
              </div>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Login Notifications</div>
              <div className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </div>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Active Sessions</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSessions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={terminateAllOtherSessions} 
            disabled={loading || sessions.filter(s => !s.current).length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sign Out Other Sessions
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-6">
                  <div className="flex-shrink-0 mr-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                  <div className="flex-grow">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div>
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No active sessions found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card 
              key={session.$id} 
              className={`w-full ${session.current ? 'border-primary/50 bg-primary/5' : ''}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start p-6">
                  <div className="flex-shrink-0 mr-4">
                    {getDeviceIcon(session)}
                  </div>
                  <div className="flex-grow">
                    <div>
                      <h4 className="text-sm font-medium flex items-center">
                        {session.clientName} on {session.osName}
                        {session.current && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Current Session
                          </span>
                        )}
                      </h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span>
                            {session.ip} • {session.countryName || 'Unknown location'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatRelativeTime(session.providerAccessTokenExpiry)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={terminating === session.$id}
                      onClick={() => terminateSession(session.$id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {terminating === session.$id ? (
                        <span>Terminating...</span>
                      ) : (
                        <span>Sign Out</span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}