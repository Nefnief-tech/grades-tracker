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
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}