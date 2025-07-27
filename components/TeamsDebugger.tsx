'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Database, AlertTriangle } from 'lucide-react';

export default function TeamsDebugger() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    setDebugInfo(null);
    
    try {
      console.log('🔍 DEBUG: Fetching teams...');
      
      const { debugTeamsCollection } = await import('@/lib/debug-teams-fetch');
      const userId = user.id || user.$id || (user as any).userId;
      
      console.log('👤 User ID to use:', userId);
      
      const result = await debugTeamsCollection(userId);
      console.log('📋 Debug result:', result);
      
      setDebugInfo(result);
      
      if (result.teams) {
        setTeams(result.teams);
      } else if (result.allTeams) {
        setTeams(result.allTeams);
      } else {
        setTeams([]);
      }
      
    } catch (error) {
      console.error('❌ Error in debug fetch:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please log in to view teams</p>
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
                <Database className="h-5 w-5" />
                Teams Debug Information
              </CardTitle>
              <CardDescription>
                Debug info for teams collection and user teams
              </CardDescription>
            </div>
            <Button
              onClick={fetchTeams}
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
          <div>
            <h4 className="font-medium mb-2">User Information:</h4>
            <div className="space-y-1 text-sm">
              <p><strong>User ID (user.id):</strong> {user.id}</p>
              <p><strong>User $id:</strong> {(user as any).$id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name}</p>
            </div>
          </div>

          {debugInfo && (
            <div>
              <h4 className="font-medium mb-2">Collection Debug Info:</h4>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Teams Found:</h4>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teams...
              </div>
            ) : teams.length > 0 ? (
              <div className="space-y-2">
                {teams.map((team, index) => (
                  <Card key={team.$id || index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{team.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {team.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {team.memberCount || 0} members
                          </Badge>
                          {team.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p><strong>Team ID:</strong> {team.$id}</p>
                        <p><strong>Owner ID:</strong> {team.ownerId || team.owner || team.createdBy || 'Not found'}</p>
                        <p><strong>Created:</strong> {team.createdAt}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                No teams found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}