'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTeams } from '@/lib/teams-simple';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TeamsListFixed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserTeams = async () => {
    if (!user) {
      console.log('❌ No user found for team loading');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the same user ID logic as team creation
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔍 [TeamsListFixed] Loading teams for user:', userId);
      console.log('🔍 [TeamsListFixed] User object:', user);
      
      if (!userId) {
        throw new Error('Cannot determine user ID');
      }
      
      const userTeams = await getUserTeams(userId);
      console.log('📋 [TeamsListFixed] Loaded teams:', userTeams);
      
      setTeams(userTeams);
      
      if (userTeams.length === 0) {
        console.log('ℹ️ No teams found for user');
      }
      
    } catch (error: any) {
      console.error('❌ [TeamsListFixed] Error loading teams:', error);
      toast({
        title: "Failed to load teams",
        description: error.message || "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTeams();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to view your teams</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Teams
              </CardTitle>
              <CardDescription>
                Teams you own or are a member of
              </CardDescription>
            </div>
            <Button
              onClick={loadUserTeams}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading teams...</span>
            </div>
          ) : teams.length > 0 ? (
            <div className="space-y-4">
              {teams.map((team) => (
                <Card key={team.$id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {team.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {team.memberCount || 1} members
                          </Badge>
                          {team.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            ID: {team.$id}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created or joined any teams yet.
              </p>
              <Button>Create Your First Team</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}