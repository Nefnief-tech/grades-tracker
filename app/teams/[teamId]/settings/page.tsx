'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Users,
  Settings,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  Globe,
  Lock,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw,
  Mail,
  MoreVertical,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { getDatabases, DATABASE_ID } from '@/lib/appwrite';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string;
  
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowMemberInvites, setAllowMemberInvites] = useState(false);
  const [maxMembers, setMaxMembers] = useState(50);

  // Sample data
  const sampleTeam = {
    $id: teamId,
    name: 'Computer Science Study Group',
    description: 'Collaborative learning for CS courses and project development',
    role: 'owner',
    memberCount: 12,
    isPublic: false,
    maxMembers: 50,
    createdAt: new Date().toISOString(),
    settings: {
      allowMemberInvites: true,
      requireApproval: true,
      showMemberList: true
    }
  };

  const sampleMembers = [
    {
      $id: 'user1',
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      role: 'owner',
      avatar: null,
      status: 'online',
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date().toISOString()
    },
    {
      $id: 'user2',
      name: 'Bob Smith',
      email: 'bob@university.edu',
      role: 'admin',
      avatar: null,
      status: 'away',
      joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      $id: 'user3',
      name: 'Charlie Wilson',
      email: 'charlie@university.edu',
      role: 'member',
      avatar: null,
      status: 'offline',
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setTeam(sampleTeam);
      setMembers(sampleMembers);
      setTeamName(sampleTeam.name);
      setTeamDescription(sampleTeam.description);
      setIsPublic(sampleTeam.isPublic);
      setRequireApproval(sampleTeam.settings.requireApproval);
      setAllowMemberInvites(sampleTeam.settings.allowMemberInvites);
      setMaxMembers(sampleTeam.maxMembers);
      setLoading(false);
    }, 1000);
  }, [teamId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-orange-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Team settings have been updated successfully.",
      });
      setSaving(false);
    }, 1000);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(members.map(member => 
      member.$id === memberId ? { ...member, role: newRole } : member
    ));
    toast({
      title: "Role updated",
      description: "Member role has been changed successfully.",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.$id !== memberId));
    toast({
      title: "Member removed",
      description: "Member has been removed from the team.",
    });
  };

  const handleDeleteTeam = () => {
    // Show confirmation dialog and handle team deletion
    toast({
      title: "Team deleted",
      description: "Team has been permanently deleted.",
      variant: "destructive"
    });
    router.push('/teams');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading team settings...</p>
        </div>
      </div>
    );
  }

  if (!team || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-xl font-semibold">Access denied</h2>
            <p className="text-muted-foreground">You don't have permission to view these settings.</p>
            <Button asChild>
              <Link href="/teams">Back to Teams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href={`/teams/${teamId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Team
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Team Settings</h1>
                <p className="text-muted-foreground">{team.name}</p>
              </div>            </div>
          </div>
          
          <Badge variant={getRoleBadgeVariant(team.role)} className="flex items-center gap-1">
            {getRoleIcon(team.role)}
            <span>{team.role}</span>
          </Badge>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                  Update your team's basic information and visibility settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Maximum Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Describe your team's purpose..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Visibility & Privacy</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 font-medium">
                        {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {isPublic ? 'Public Team' : 'Private Team'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isPublic 
                          ? 'Anyone can find and join this team'
                          : 'Only invited members can join this team'
                        }
                      </p>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Management */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members ({members.length})</CardTitle>
                    <CardDescription>
                      Manage your team members and their roles.
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.$id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {member.role !== 'owner' && (team.role === 'owner' || team.role === 'admin') && (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleRoleChange(member.$id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                {team.role === 'owner' && (
                                  <SelectItem value="owner">Owner</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.$id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {member.role === 'owner' && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Permissions</CardTitle>
                <CardDescription>
                  Configure what team members can and cannot do.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Require approval for new members</Label>
                      <p className="text-sm text-muted-foreground">
                        New join requests must be approved by an admin
                      </p>
                    </div>
                    <Switch
                      checked={requireApproval}
                      onCheckedChange={setRequireApproval}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Allow member invites</Label>
                      <p className="text-sm text-muted-foreground">
                        Regular members can invite new people to the team
                      </p>
                    </div>
                    <Switch
                      checked={allowMemberInvites}
                      onCheckedChange={setAllowMemberInvites}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Permissions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions for this team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this team and all its data. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteTeam}
                      disabled={team.role !== 'owner'}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </Button>
                  </div>
                  {team.role !== 'owner' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Only the team owner can delete this team.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}