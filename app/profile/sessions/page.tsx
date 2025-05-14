"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionCard } from "@/components/profile/session-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCwIcon, ShieldAlertIcon, LogOutIcon } from "lucide-react";
import { getActiveSessions, endSession, endAllOtherSessions, getCurrentSession } from "@/lib/session-manager";
import { logout } from "@/lib/appwrite";

export default function SessionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Fetch all active sessions
      const allSessions = await getActiveSessions();
      setSessions(allSessions || []);
      
      // Fetch current session
      const current = await getCurrentSession();
      setCurrentSession(current);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch sessions",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession(sessionId);
      toast({
        title: "Session ended",
        description: "The session has been terminated successfully.",
      });
      fetchSessions();
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        variant: "destructive",
        title: "Failed to end session",
        description: "Please try again later.",
      });
    }
  };

  const handleEndAllOtherSessions = async () => {
    try {
      await endAllOtherSessions();
      toast({
        title: "All other sessions ended",
        description: "All sessions except the current one have been terminated.",
      });
      fetchSessions();
    } catch (error) {
      console.error("Error ending sessions:", error);
      toast({
        variant: "destructive",
        title: "Failed to end sessions",
        description: "Please try again later.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Failed to sign out",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Manage your active sessions</p>
        </div>
        <Button variant="outline" onClick={fetchSessions} disabled={loading}>
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlertIcon className="h-5 w-5 mr-2 text-amber-500" />
              Session Security
            </CardTitle>
            <CardDescription>
              Sessions allow you to stay logged in across different devices. You can sign out from any device that you're no longer using.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                onClick={handleEndAllOtherSessions}
                disabled={loading || sessions.length <= 1}
              >
                Sign out from all other devices
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign out from this device
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No active sessions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {/* Display current session first */}
              {currentSession && (
                <SessionCard
                  key={currentSession.$id}
                  session={currentSession}
                  isCurrentSession={true}
                  onEndSession={() => {}}
                />
              )}

              {/* Display other sessions */}
              {sessions
                .filter(session => session.$id !== currentSession?.$id)
                .map(session => (
                  <SessionCard
                    key={session.$id}
                    session={session}
                    isCurrentSession={false}
                    onEndSession={handleEndSession}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}