'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, RefreshCw, Database } from 'lucide-react';
import InviteManager from '@/components/InviteManager';
import DatabaseSetupGuide from '@/components/DatabaseSetupGuide';
import { getUserInvites } from '@/lib/invite-service';

export default function InvitationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteCount, setInviteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadInviteCount = async () => {
    if (!user?.email) return;

    try {
      const userInvites = await getUserInvites(user.email);
      setInviteCount(userInvites.teamInvites.length + userInvites.channelInvites.length);
    } catch (error) {
      console.error('Error loading invite count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadInviteCount();
    // Force refresh of InviteManager component
    window.location.reload();
  };

  useEffect(() => {
    loadInviteCount();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to view invitations</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Invitations
          </h1>
          <p className="text-muted-foreground">
            Manage your team and channel invitations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Summary</CardTitle>
          <CardDescription>
            Overview of your pending invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? '...' : inviteCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending Invitations
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.email}
              </div>
              <div className="text-sm text-muted-foreground">
                Your Email
              </div>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Invite Manager with Tabs */}
      <Tabs defaultValue="invites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invites">Your Invitations</TabsTrigger>
          <TabsTrigger value="setup">Database Setup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invites" className="space-y-4">
          <InviteManager />
        </TabsContent>
        
        <TabsContent value="setup" className="space-y-4">
          <DatabaseSetupGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}