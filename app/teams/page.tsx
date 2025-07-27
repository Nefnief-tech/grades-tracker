'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTeams, fixTeamOwnership } from '@/lib/teams-simple';
import CreateTeam from '@/components/CreateTeam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Plus, 
  Users, 
  Settings, 
  Eye, 
  RefreshCw, 
  Mail, 
  Search,
  Filter,
  Crown,
  Shield,
  Globe,
  Lock,
  Calendar,
  MoreVertical,
  MessageSquare,
  Star,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const loadUserTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔍 [Teams Page] Loading teams for user:', userId);
      
      if (!userId) {
        throw new Error('Cannot determine user ID');
      }        const userTeams = await getUserTeams(userId);
      console.log('📋 [Teams Page] Loaded teams:', userTeams);      // Add role information based on actual team data
      const teamsWithRoles = userTeams.map((team) => {
        // Determine user role based on team creator (prioritize userId since that's what's in the database)
        const creatorId = team.userId || team.createdBy || team.creator || team.owner;
        
        // TEMPORARY FIX: Since creator fields are not being stored properly,
        // assume the current user is the owner if they can see the team and no creator is set
        let isOwner = creatorId === userId;
        
        // If no creator is found but user has access, assume they're the owner
        if (!creatorId && team) {
          isOwner = true;
          console.log('⚠️ [Teams Page] No creator found, assuming current user is owner');
        }
        
        const role = isOwner ? 'owner' : 'member';
        
        // Debug logging for ownership detection
        console.log('🔍 [Teams Page] Role detection:', {
          teamName: team.name,
          teamId: team.$id,
          currentUserId: userId,
          creatorId: creatorId,
          teamUserId: team.userId,
          teamCreatedBy: team.createdBy,
          isOwner: isOwner,
          finalRole: role
        });
        
        return {
          ...team,
          role,
          lastActivity: team.updatedAt || team.createdAt,
          unreadMessages: 0, // You can implement this later with a messaging system
          isFavorite: false, // You can implement favorites later
          memberCount: team.members ? team.members.length + 1 : 1 // +1 for creator
        };
      });
      
      setTeams(teamsWithRoles);
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
  };  const handleTeamCreated = async (newTeam: any) => {
    console.log('✅ Team created, refreshing list...');
    console.log('🔍 [Teams Page] New team data received:', newTeam);
    
    const userId = user?.$id || (user as any)?.id || (user as any)?.userId;
    console.log('🔍 [Teams Page] Current user ID for new team:', userId);
    
    // Instead of manually adding the team, reload all teams from database
    // This ensures we get the correct ownership information
    setShowCreateForm(false);
    toast({
      title: "Team created successfully!",
      description: `${newTeam.name} is ready for collaboration`,
    });
      // Reload teams to get fresh data with correct ownership
    await loadUserTeams();
  };

  const handleFixOwnership = async () => {
    if (!user) return;
    
    const userId = user.$id || (user as any).id || (user as any).userId;
    
    try {
      // Fix ownership for all teams that don't have creator fields
      const promises = teams
        .filter(team => !team.userId && !team.createdBy)
        .map(team => fixTeamOwnership(team.$id, userId));
      
      await Promise.all(promises);
      
      toast({
        title: "Ownership fixed!",
        description: "All teams now have proper ownership assigned.",
      });
      
      // Reload teams to see changes
      await loadUserTeams();
      
    } catch (error) {
      console.error('Error fixing ownership:', error);
      toast({
        title: "Error fixing ownership",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const filteredAndSortedTeams = teams
    .filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           team.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || team.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return (b.memberCount || 1) - (a.memberCount || 1);
        case 'recent':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        default:
          return 0;
      }
    });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  useEffect(() => {
    loadUserTeams();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to access your teams</p>
            </div>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
              className="w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </div>
          <CreateTeam
            onTeamCreated={handleTeamCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <Button variant="ghost" asChild className="w-fit">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                <p className="text-muted-foreground">Collaborate and manage your teams</p>
              </div>
            </div>
          </div>
            <div className="flex gap-3">
            {/* Temporary Fix Button */}
            {teams.some(team => !team.userId && !team.createdBy && !team.owner) && (
              <Button
                variant="destructive"
                onClick={handleFixOwnership}
                size="sm"
              >
                🔧 Fix Ownership
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <Link href="/invitations">
                <Mail className="h-4 w-4 mr-2" />
                Invitations
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={loadUserTeams}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button onClick={() => setShowCreateForm(true)} size="lg" className="w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading your teams...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{teams.length}</p>
                      <p className="text-sm text-muted-foreground">Total Teams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{teams.filter(t => t.role === 'owner').length}</p>
                      <p className="text-sm text-muted-foreground">Owned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{teams.filter(t => t.role === 'admin').length}</p>
                      <p className="text-sm text-muted-foreground">Admin</p>
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
                      <p className="text-2xl font-bold">{teams.reduce((sum, t) => sum + (t.unreadMessages || 0), 0)}</p>
                      <p className="text-sm text-muted-foreground">Unread</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Find Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent Activity</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="members">Member Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Teams Grid */}
            {filteredAndSortedTeams.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedTeams.map((team) => (
                  <Card key={team.$id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className={`text-sm font-medium ${
                              team.role === 'owner' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                              team.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {getTeamInitials(team.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {team.name}
                              </CardTitle>
                              {team.isFavorite && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <CardDescription className="line-clamp-2 mt-1">
                              {team.description || 'No description provided'}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Team Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{team.memberCount || 1}</span>
                          </div>
                          {team.unreadMessages > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <MessageSquare className="h-4 w-4" />
                              <span>{team.unreadMessages}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatLastActivity(team.lastActivity)}</span>
                          </div>
                        </div>
                        {team.isPublic ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getRoleBadgeVariant(team.role)} className="flex items-center gap-1">
                          {getRoleIcon(team.role)}
                          {team.role}
                        </Badge>
                        {team.isPublic && (
                          <Badge variant="outline">Public</Badge>
                        )}
                        <Badge variant="secondary">
                          Max: {team.maxMembers || 50}
                        </Badge>
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/teams/${team.$id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1" size="sm">
                          <Link href={`/teams/${team.$id}/settings`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Link>
                        </Button>
                      </div>

                      {/* Team Info */}
                      <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                        <p>ID: {team.$id}</p>
                        <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">
                      {searchQuery || filterRole !== 'all' ? 'No teams found' : 'No teams yet'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {searchQuery || filterRole !== 'all' 
                        ? 'Try adjusting your search or filters to find teams'
                        : 'Create your first team to start collaborating with others'
                      }
                    </p>
                  </div>
                  {!searchQuery && filterRole === 'all' && (
                    <Button size="lg" onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Team
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}