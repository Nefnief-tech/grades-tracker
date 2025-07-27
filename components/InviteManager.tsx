'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, Check, X, Users, Hash, Clock, Calendar } from 'lucide-react';
import { getUserInvites, acceptTeamInvite, declineInvite } from '@/lib/invite-service';

export default function InviteManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<{teamInvites: any[], channelInvites: any[]}>({
    teamInvites: [],
    channelInvites: []
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadInvites = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const userInvites = await getUserInvites(user.email);
      setInvites(userInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Failed to load invites",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTeamInvite = async (invite: any) => {
    if (!user) return;

    setProcessing(invite.$id);
    try {
      const userId = user.id || (user as any).$id;
      const userName = user.name || user.email;

      await acceptTeamInvite(invite.$id, userId, userName);
      
      toast({
        title: "Invitation accepted!",
        description: `You've joined ${invite.teamName}`,
      });

      // Remove from local state
      setInvites(prev => ({
        ...prev,
        teamInvites: prev.teamInvites.filter(inv => inv.$id !== invite.$id)
      }));

    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Failed to accept invitation",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineInvite = async (invite: any, type: 'team' | 'channel') => {
    setProcessing(invite.$id);
    try {
      await declineInvite(invite.$id, type);
      
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined",
      });

      // Remove from local state
      if (type === 'team') {
        setInvites(prev => ({
          ...prev,
          teamInvites: prev.teamInvites.filter(inv => inv.$id !== invite.$id)
        }));
      } else {
        setInvites(prev => ({
          ...prev,
          channelInvites: prev.channelInvites.filter(inv => inv.$id !== invite.$id)
        }));
      }

    } catch (error: any) {
      console.error('Error declining invite:', error);
      toast({
        title: "Failed to decline invitation",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  useEffect(() => {
    loadInvites();
  }, [user]);

  if (!user) {
    return null;
  }

  const totalInvites = invites.teamInvites.length + invites.channelInvites.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invitations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalInvites === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
          <p className="text-muted-foreground">
            You don't have any pending team or channel invitations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Invites */}
      {invites.teamInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Invitations ({invites.teamInvites.length})
            </CardTitle>
            <CardDescription>
              You've been invited to join these teams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invites.teamInvites.map((invite) => (
              <div key={invite.$id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{invite.teamName}</h4>
                    <Badge variant="secondary">{invite.role}</Badge>
                    {isExpired(invite.expiresAt) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Invited by {invite.inviterName}
                  </p>
                  {invite.message && (
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{invite.message}"
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeLeft(invite.expiresAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptTeamInvite(invite)}
                    disabled={processing === invite.$id || isExpired(invite.expiresAt)}
                  >
                    {processing === invite.$id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvite(invite, 'team')}
                    disabled={processing === invite.$id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Channel Invites */}
      {invites.channelInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Channel Invitations ({invites.channelInvites.length})
            </CardTitle>
            <CardDescription>
              You've been invited to join these channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invites.channelInvites.map((invite) => (
              <div key={invite.$id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">#{invite.channelName}</h4>
                    {isExpired(invite.expiresAt) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Invited by {invite.inviterName}
                  </p>
                  {invite.message && (
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{invite.message}"
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeLeft(invite.expiresAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={processing === invite.$id || isExpired(invite.expiresAt)}
                  >
                    {processing === invite.$id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Join
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvite(invite, 'channel')}
                    disabled={processing === invite.$id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}