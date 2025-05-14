"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionCard } from "@/components/profile/session-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCwIcon, ShieldAlertIcon, LogOutIcon } from "lucide-react";
import { getActiveSessions, endSession, endAllOtherSessions, getCurrentSession } from "@/lib/session-manager";
import { logout } from "@/lib/appwrite-client";

export default function ActivityPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isEndingAllSessions, setIsEndingAllSessions] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch all active sessions and identify current session
  async function fetchSessions() {
    setIsLoading(true);
    try {
      const [activeSessions, currentSession] = await Promise.all([
        getActiveSessions(),
        getCurrentSession()
      ]);
      
      setSessions(activeSessions);
      setCurrentSessionId(currentSession.$id);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast({
        title: "Error",
        description: "Could not load your active sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle ending a specific session
  const handleEndSession = async (sessionId: string) => {
    setIsEndingSession(true);
    try {
      await endSession(sessionId);
      setSessions((prevSessions) => prevSessions.filter((session) => session.$id !== sessionId));
      toast({
        title: "Success",
        description: "Session ended successfully",
      });
    } catch (error) {
      console.error("Failed to end session:", error);
      toast({
        title: "Error",
        description: "Could not end the session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  // Handle ending all other sessions
  const handleEndAllOtherSessions = async () => {
    setIsEndingAllSessions(true);
    try {
      await endAllOtherSessions();
      // Keep only the current session
      setSessions((prevSessions) => 
        prevSessions.filter((session) => session.$id === currentSessionId)
      );
      toast({
        title: "Success",
        description: "All other sessions have been ended",
      });
    } catch (error) {
      console.error("Failed to end all other sessions:", error);
      toast({
        title: "Error",
        description: "Could not end all sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEndingAllSessions(false);
    }
  };

  // Handle signing out from all devices
  const handleSignOutEverywhere = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Account Activity</h1>
      
      <Tabs defaultValue="sessions" className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your active sessions</h2>
            <Button 
              variant="outline" 
              onClick={fetchSessions} 
              disabled={isLoading}
            >
              <RefreshCwIcon className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          
          <div className="space-y-4">
            {sessions.length === 0 && !isLoading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <ShieldAlertIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active sessions found</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {sessions.map((session) => (
                  <SessionCard
                    key={session.$id}
                    session={session}
                    isCurrentSession={session.$id === currentSessionId}
                    onEndSession={handleEndSession}
                    isLoading={isEndingSession}
                  />
                ))}
              </>
            )}
          </div>
          
          {sessions.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Manage all sessions</CardTitle>
                <CardDescription>
                  End all sessions except for your current one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleEndAllOtherSessions}
                  disabled={isEndingAllSessions}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  {isEndingAllSessions ? "Ending all sessions..." : "End all other sessions"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Sign out everywhere</CardTitle>
              <CardDescription>
                Sign out of all devices including this one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleSignOutEverywhere}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out everywhere
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}