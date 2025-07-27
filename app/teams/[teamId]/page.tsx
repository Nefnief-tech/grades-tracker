'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Users,
  Settings,
  UserPlus,
  MessageSquare,
  Hash,
  Lock,
  Globe,
  Crown,
  Shield,
  Calendar,
  Clock,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Search,
  Bell,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import TeamChat from '@/components/TeamChat';
import { getTeamById, getTeamMembers } from '@/lib/teams-simple';

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const teamId = params?.teamId as string;
  
  const [team, setTeam] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Load team data from database
  const loadTeamData = async () => {
    if (!teamId || !user) return;
    
    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      
      // Get team details
      const teamData = await getTeamById(teamId, userId);
      if (!teamData) {
        throw new Error('Team not found or access denied');
      }
      
      setTeam(teamData);
      
      // Get team members
      const teamMembers = await getTeamMembers(teamId, userId);
      setMembers(teamMembers);
      
      // Initialize with a general channel for now
      const generalChannel = {
        $id: 'general',
        name: 'general',
        description: 'General team discussion',
        type: 'text',
        isPrivate: false,
        memberCount: teamMembers.length,
        unreadCount: 0
      };
      setChannels([generalChannel]);
      setSelectedChannel(generalChannel);
      
      toast({
        title: "Team loaded",
        description: `Welcome to ${teamData.name}`,
      });
      
    } catch (error) {
      console.error('Error loading team:', error);
      toast({
        title: "Error loading team",
        description: "Could not load team data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId, user]);  const getUserRole = () => {
    if (!team || !user) return 'member';
    const userId = user.$id || (user as any).id || (user as any).userId;
    
    // Check if user is the team creator/owner (prioritize owner field since that's what createTeam stores)
    const creatorId = team.owner || team.userId || team.createdBy || team.creator;
    if (creatorId === userId) return 'owner';
    
    // For now, assume other members are regular members
    return 'member';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return date.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      $id: `msg-${Date.now()}`,
      content: newMessage,
      author: {
        $id: user?.$id || 'current-user',
        name: user?.name || 'You',
        avatar: null
      },
      timestamp: new Date().toISOString(),
      edited: false,
      reactions: []
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      // Here you would implement the actual invitation logic
      // For now, just show success message
      toast({
        title: "Invitation sent!",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-xl font-semibold">Team not found</h2>
            <p className="text-muted-foreground">The team you're looking for doesn't exist or you don't have access.</p>
            <Button asChild>
              <Link href="/teams">Back to Teams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRole = getUserRole();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/teams">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {team.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {team.name}
                  {team.isPublic ? <Globe className="h-5 w-5 text-muted-foreground" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                </h1>
                <p className="text-muted-foreground">{team.description || 'No description provided'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getRoleBadgeVariant(userRole)} className="flex items-center gap-1">
              {getRoleIcon(userRole)}
              {userRole}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            {userRole === 'owner' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/teams/${teamId}/settings`}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{channels.length}</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{team.maxMembers || 50}</p>
                  <p className="text-sm text-muted-foreground">Max Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Channels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.$id}
                    variant={selectedChannel?.$id === channel.$id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Hash className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          {channel.isPrivate && <Lock className="h-3 w-3" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member) => (
                  <div key={member.$id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {member.name || member.email || 'Unknown User'}
                        </span>
                        {member.$id === team.createdBy && <Crown className="h-3 w-3 text-orange-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.$id === team.createdBy ? 'Owner' : 'Member'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{selectedChannel?.name}</CardTitle>
                      <CardDescription>{selectedChannel?.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="space-y-3">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-medium">Welcome to #{selectedChannel?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Start a conversation with your team members!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.$id} className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback>
                            {message.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{message.author.name}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message #${selectedChannel?.name}...`}
                      className="min-h-[40px] max-h-32 resize-none pr-12"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
              <DialogDescription>
                Invite new members to join {team.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  placeholder="colleague@university.edu" 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember} disabled={!inviteEmail.trim()}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}