'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, UserPlus, Search, MoreVertical, Crown, Shield, User, Mail, UserMinus, Settings } from 'lucide-react';
import Link from 'next/link';
import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { createTeamInvite } from '@/lib/invite-service';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';
const TEAM_MEMBERS_COLLECTION_ID = 'team_members';

export default function TeamMembersPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  const teamId = params?.teamId as string;
  const userId = user?.id || (user as any)?.$id;
  const isOwner = team && userId && team.ownerId === userId;

  const loadTeam = async () => {
    if (!teamId) return;

    try {
      const teamDoc = await databases.getDocument(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        teamId
      );
      setTeam(teamDoc);
    } catch (error: any) {
      console.error('Error loading team:', error);
      toast({
        title: "Failed to load team",
        description: error.message || "Team not found",
        variant: "destructive"
      });
    }
  };

  const loadMembers = async () => {
    if (!teamId) return;

    try {
      console.log('🔍 Loading members for team:', teamId);
      const memberDocs = await databases.listDocuments(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        [Query.equal('teamId', [teamId])]
      );
      console.log('✅ Found members:', memberDocs.documents.length);
      setMembers(memberDocs.documents);
    } catch (error: any) {
      console.log('⚠️ Team members collection not found, creating owner entry');
      // If team_members collection doesn't exist, show owner only
      if (team && userId) {
        const ownerMember = {
          $id: 'owner-' + team.ownerId,
          userId: team.ownerId,
          userName: user?.name || user?.email || 'Team Owner',
          userEmail: user?.email || 'owner@example.com',
          role: 'owner',
          status: 'active',
          joinedAt: team.createdAt,
          invitedAt: team.createdAt,
          invitedBy: team.ownerId
        };
        setMembers([ownerMember]);
      }
    }
  };
  const inviteMember = async () => {
    if (!inviteEmail.trim() || !teamId || !userId || !team) return;

    setInviting(true);
    try {
      console.log('📧 Sending team invitation via invite service...');
      
      // Use the new invite service
      await createTeamInvite({
        teamId,
        teamName: team.name,
        inviterUserId: userId,
        inviterName: user?.name || user?.email || 'Unknown User',
        inviteeEmail: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage.trim()
      });

      setInviteEmail('');
      setInviteRole('member');
      setInviteMessage('');
      setShowInviteDialog(false);

      toast({
        title: "Invitation sent!",
        description: `${inviteEmail} has been invited to join ${team.name}`,
      });

      // Refresh members list to show pending invitations
      loadMembers();
      
    } catch (error: any) {
      console.error('❌ Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        memberId,
        { role: newRole }
      );

      setMembers(prev => prev.map(member => 
        member.$id === memberId 
          ? { ...member, role: newRole }
          : member
      ));

      toast({
        title: "Role updated",
        description: "Member role has been changed successfully",
      });
    } catch (error: any) {
      console.error('❌ Error updating member role:', error);
      toast({
        title: "Failed to update role",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        memberId
      );

      // Update team member count
      if (team) {
        await databases.updateDocument(
          DATABASE_ID,
          TEAMS_COLLECTION_ID,
          teamId,
          {
            memberCount: Math.max(1, (team.memberCount || 1) - 1)
          }
        );
      }

      setMembers(prev => prev.filter(member => member.$id !== memberId));

      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team`,
      });
    } catch (error: any) {
      console.error('❌ Error removing member:', error);
      toast({
        title: "Failed to remove member",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const filteredMembers = members.filter(member => 
    member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'default',
      admin: 'secondary',
      member: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      invited: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  useEffect(() => {
    if (team) {
      loadMembers();
    }
  }, [team]);

  if (loading && !team) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading team members...</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Team Not Found</h2>
            <Button asChild>
              <Link href="/teams">Back to Teams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/teams/${teamId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{team.name} Members</h1>
            <p className="text-muted-foreground">
              Manage team members and their roles
            </p>
          </div>
        </div>
        {isOwner && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Members
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {team.name}
                </DialogDescription>
              </DialogHeader>                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personal Message (Optional)</label>
                    <Textarea
                      placeholder="Add a personal message to the invitation..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={inviteMember} 
                      disabled={!inviteEmail.trim() || inviting}
                      className="flex-1"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{members.length} total members</span>
              <span>•</span>
              <span>{members.filter(m => m.status === 'active').length} active</span>
              <span>•</span>
              <span>{members.filter(m => m.status === 'invited').length} pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Current members of {team.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.$id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.userAvatar} />
                      <AvatarFallback>
                        {member.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.userName}</h4>
                        {getRoleIcon(member.role)}
                        {member.role === 'owner' && <span className="text-xs text-yellow-600">(You)</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.status === 'active' ? 'Joined' : 'Invited'} {new Date(member.joinedAt || member.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                    {isOwner && member.role !== 'owner' && (
                      <div className="flex gap-1">
                        <Select 
                          value={member.role} 
                          onValueChange={(newRole) => updateMemberRole(member.$id, newRole)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeMember(member.$id, member.userName)}
                        >
                          <UserMinus className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No members match your search.' : 'This team has no members yet.'}
              </p>
              {!searchTerm && isOwner && (
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}