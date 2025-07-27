'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTeam } from '@/lib/teams-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Plus } from 'lucide-react';

interface CreateTeamProps {
  onTeamCreated?: (team: any) => void;
  onCancel?: () => void;
}

export default function CreateTeam({ onTeamCreated, onCancel }: CreateTeamProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a team",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);    try {      console.log('🔍 About to create team with payload containing ownerId attribute');
      console.log('🔍 Current user object:', user);
      console.log('🔍 User ID from user.$id:', user.$id);
      console.log('🔍 User ID from user.id:', (user as any).id);
      
      // Try different ways to get user ID
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔍 Final userId to use:', userId);
        if (!userId) {
        throw new Error('Cannot get user ID. User object: ' + JSON.stringify(user));
      }
      
      // USING COMPLETELY NEW FIXED FUNCTION
      const { createTeamFixed } = await import('@/lib/teams-fixed');
      
      const team = await createTeamFixed(
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isPublic: formData.isPublic,
          maxMembers: formData.maxMembers
        },
        userId,
        user.name || user.email,
        user.email // Pass user email for team member record
      );

      console.log('✅ Team created successfully:', team);

      toast({
        title: "Team created successfully",
        description: `${formData.name} is ready for collaboration`,
      });

      onTeamCreated?.(team);
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast({
        title: "Failed to create team",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle>Create New Team</CardTitle>
        </div>
        <CardDescription>
          Start collaborating with your team members
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              type="text"
              placeholder="My Awesome Team"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              placeholder="What's this team about? (optional)"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-members">Maximum Members</Label>
            <Input
              id="max-members"
              type="number"
              min="2"
              max="100"
              value={formData.maxMembers}
              onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 50)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-public">Public Team</Label>
              <p className="text-xs text-muted-foreground">
                Allow anyone to find and join this team
              </p>
            </div>
            <Switch
              id="is-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardContent className="pt-0">
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}