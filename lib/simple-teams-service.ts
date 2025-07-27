import { getDatabases, DATABASE_ID } from './appwrite';
import { Query, ID } from 'appwrite';

const databases = getDatabases();

// For now, we'll store teams in your existing subjects collection or create a simple storage
// This is a minimal implementation that works with your current setup

export interface SimpleTeam {
  $id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  isPrivate: boolean;
  requireApproval: boolean;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleChannel {
  $id: string;
  teamId: string;
  name: string;
  description: string;
  isAdminOnly: boolean;
  createdBy: string;
  createdAt: string;
}

// Store teams in localStorage for now (will move to Appwrite when collections are ready)
const TEAMS_STORAGE_KEY = 'grade-tracker-teams';
const CHANNELS_STORAGE_KEY = 'grade-tracker-channels';

// Get teams from localStorage
function getStoredTeams(): SimpleTeam[] {
  try {
    const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save teams to localStorage
function storeTeams(teams: SimpleTeam[]): void {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (error) {
    console.error('Failed to store teams:', error);
  }
}

// Get channels from localStorage
function getStoredChannels(): SimpleChannel[] {
  try {
    const stored = localStorage.getItem(CHANNELS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save channels to localStorage
function storeChannels(channels: SimpleChannel[]): void {
  try {
    localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(channels));
  } catch (error) {
    console.error('Failed to store channels:', error);
  }
}

// Get user's teams
export async function getUserTeams(userId: string): Promise<any[]> {
  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const teams = getStoredTeams();
    
    return teams
      .filter(team => team.memberIds.includes(userId))
      .map(team => ({
        $id: team.$id,
        name: team.name,
        description: team.description,
        isPrivate: team.isPrivate,
        userRole: team.ownerId === userId ? 'owner' : 'member',
        memberCount: team.memberIds.length,
        hasAdminAccess: team.ownerId === userId,
        hasOwnerAccess: team.ownerId === userId,
        lastActivity: team.updatedAt,
        unreadCount: Math.floor(Math.random() * 3) // Simulate unread messages
      }));
  } catch (error) {
    console.error('Error getting user teams:', error);
    throw error;
  }
}

// Create a new team
export async function createTeam(
  ownerId: string,
  teamData: {
    name: string;
    description: string;
    isPrivate: boolean;
    requireApproval: boolean;
    maxMembers: number;
  }
): Promise<SimpleTeam> {
  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const teams = getStoredTeams();
    
    const newTeam: SimpleTeam = {
      $id: `team-${Date.now()}`,
      name: teamData.name,
      description: teamData.description,
      ownerId,
      memberIds: [ownerId],
      isPrivate: teamData.isPrivate,
      requireApproval: teamData.requireApproval,
      maxMembers: teamData.maxMembers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    teams.push(newTeam);
    storeTeams(teams);
    
    // Create default general channel
    await createChannel(newTeam.$id, ownerId, {
      name: 'general',
      description: 'General team discussion',
      isAdminOnly: false
    });
    
    return newTeam;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

// Get team channels
export async function getTeamChannels(teamId: string, userId: string): Promise<any[]> {
  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const teams = getStoredTeams();
    const team = teams.find(t => t.$id === teamId);
    
    if (!team || !team.memberIds.includes(userId)) {
      throw new Error('Access denied');
    }
    
    const channels = getStoredChannels();
    const teamChannels = channels.filter(channel => channel.teamId === teamId);
    
    const isOwner = team.ownerId === userId;
    
    return teamChannels
      .filter(channel => !channel.isAdminOnly || isOwner)
      .map(channel => ({
        $id: channel.$id,
        name: channel.name,
        description: channel.description,
        type: channel.isAdminOnly ? 'admin_only' : 'general',
        isPrivate: channel.isAdminOnly,
        memberCount: channel.isAdminOnly ? 1 : team.memberIds.length,
        unreadCount: Math.floor(Math.random() * 2),
        lastMessage: 'Welcome to the channel!'
      }));
  } catch (error) {
    console.error('Error getting team channels:', error);
    throw error;
  }
}

// Create a new channel
export async function createChannel(
  teamId: string,
  creatorId: string,
  channelData: {
    name: string;
    description: string;
    isAdminOnly: boolean;
  }
): Promise<SimpleChannel> {
  try {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const teams = getStoredTeams();
    const team = teams.find(t => t.$id === teamId);
    
    if (!team || team.ownerId !== creatorId) {
      throw new Error('Only team owners can create channels');
    }
    
    const channels = getStoredChannels();
    
    const newChannel: SimpleChannel = {
      $id: `channel-${Date.now()}`,
      teamId,
      name: channelData.name,
      description: channelData.description,
      isAdminOnly: channelData.isAdminOnly,
      createdBy: creatorId,
      createdAt: new Date().toISOString()
    };
    
    channels.push(newChannel);
    storeChannels(channels);
    
    return newChannel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
}

// Join a team
export async function joinTeam(teamId: string, userId: string): Promise<void> {
  try {
    const teams = getStoredTeams();
    const teamIndex = teams.findIndex(t => t.$id === teamId);
    
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    const team = teams[teamIndex];
    
    if (team.memberIds.includes(userId)) {
      throw new Error('Already a member');
    }
    
    if (team.memberIds.length >= team.maxMembers) {
      throw new Error('Team is full');
    }
    
    team.memberIds.push(userId);
    team.updatedAt = new Date().toISOString();
    
    storeTeams(teams);
  } catch (error) {
    console.error('Error joining team:', error);
    throw error;
  }
}

// Leave a team
export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  try {
    const teams = getStoredTeams();
    const teamIndex = teams.findIndex(t => t.$id === teamId);
    
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    const team = teams[teamIndex];
    
    if (team.ownerId === userId) {
      // If owner is leaving, delete the team
      teams.splice(teamIndex, 1);
      
      // Also delete all team channels
      const channels = getStoredChannels();
      const filteredChannels = channels.filter(c => c.teamId !== teamId);
      storeChannels(filteredChannels);
    } else {
      // Remove user from members
      team.memberIds = team.memberIds.filter(id => id !== userId);
      team.updatedAt = new Date().toISOString();
    }
    
    storeTeams(teams);
  } catch (error) {
    console.error('Error leaving team:', error);
    throw error;
  }
}