'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTeams } from '@/lib/teams-simple';
import CreateTeam from '@/components/CreateTeam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Users, Settings, Eye, RefreshCw, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadUserTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use the same user ID logic as team creation
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔍 [Teams Page] Loading teams for user:', userId);
      
      if (!userId) {
        throw new Error('Cannot determine user ID');
      }
      
      const userTeams = await getUserTeams(userId);
      console.log('📋 [Teams Page] Loaded teams:', userTeams);
      
      setTeams(userTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Failed to load teams",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam: any) => {
    console.log('✅ Team created, refreshing list...');
    setTeams(prev => [...prev, newTeam]);
    setShowCreateForm(false);
    toast({
      title: "Team created successfully!",
      description: `${newTeam.name} is ready for collaboration`,
    });
  };

  useEffect(() => {
    loadUserTeams();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to view teams</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(false)}
          >
            ← Back to Teams
          </Button>
        </div>
        <CreateTeam
          onTeamCreated={handleTeamCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and collaborate with others
          </p>
        </div>        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/invitations">
              <Mail className="mr-2 h-4 w-4" />
              Invitations
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={loadUserTeams}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading your teams...</span>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.$id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {team.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {team.memberCount || 1} members
                    </Badge>
                    {team.isPublic && (
                      <Badge variant="outline">Public</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Max: {team.maxMembers || 50}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/teams/${team.$id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      Open
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/teams/${team.$id}/settings`}>
                      <Settings className="mr-1 h-3 w-3" />
                      Settings
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <p>Team ID: {team.$id}</p>
                  <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first team to start collaborating with others
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}