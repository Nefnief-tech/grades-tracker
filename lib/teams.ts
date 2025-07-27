import { getDatabases } from './appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID } from './appwrite';

const databases = getDatabases();

// Collection IDs
export const TEAMS_COLLECTION_ID = 'teams';
export const TEAM_MEMBERS_COLLECTION_ID = 'team_members';
export const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';
export const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';
export const TEAM_INVITATIONS_COLLECTION_ID = 'team_invitations';
export const MESSAGE_REACTIONS_COLLECTION_ID = 'message_reactions';

// Types
export interface Team {
  $id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  avatar?: string;
  maxMembers: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  $id: string;
  teamId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'inactive';
  invitedBy: string;
  joinedAt?: string;
  invitedAt: string;
  lastActive?: string;
}

export interface ChatChannel {
  $id: string;
  teamId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement';
  isPrivate: boolean;
  createdBy: string;
  messageCount: number;
  lastMessageAt?: string;
  lastMessageId?: string;
  createdAt: string;
}

export interface ChatMessage {
  $id: string;
  channelId: string;
  teamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: string;
  replyToId?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface TeamInvitation {
  $id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  invitedUserId?: string;
  invitedBy: string;
  inviterName: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  token: string;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
}

// Team Services
export class TeamService {
  // Create a new team
  static async createTeam(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    maxMembers?: number;
  }, userId: string, userName: string): Promise<Team> {
    const team = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        ownerId: userId,
        isPublic: data.isPublic || false,
        maxMembers: data.maxMembers || 50,
        memberCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );    // Add creator as owner (using admin role since owner is not in the interface)
    await this.addTeamMember({
      teamId: team.$id,
      userId,
      userEmail: '', // Will be filled by the calling function
      userName,
      role: 'admin', // Use admin role for owner
      status: 'active',
      invitedBy: userId
    });

    // Create default general channel
    await ChatService.createChannel({
      teamId: team.$id,
      name: 'general',
      description: 'General discussion',
      type: 'text',
      isPrivate: false
    }, userId);

    return team as Team;
  }

  // Get user's teams
  static async getUserTeams(userId: string): Promise<Team[]> {
    const memberRecords = await databases.listDocuments(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('status', 'active')
      ]
    );

    if (memberRecords.documents.length === 0) {
      return [];
    }

    const teamIds = memberRecords.documents.map(member => member.teamId);
    const teams = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      [Query.equal('$id', teamIds)]
    );

    return teams.documents as Team[];
  }

  // Get team details
  static async getTeam(teamId: string): Promise<Team | null> {
    try {
      const team = await databases.getDocument(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        teamId
      );
      return team as Team;
    } catch (error) {
      return null;
    }
  }

  // Add team member
  static async addTeamMember(data: {
    teamId: string;
    userId: string;
    userEmail: string;
    userName: string;
    role: 'admin' | 'member';
    status: 'pending' | 'active';
    invitedBy: string;
  }): Promise<TeamMember> {
    const member = await databases.createDocument(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        invitedAt: new Date().toISOString(),
        joinedAt: data.status === 'active' ? new Date().toISOString() : null
      }
    );

    // Update team member count
    if (data.status === 'active') {
      const team = await this.getTeam(data.teamId);
      if (team) {
        await databases.updateDocument(
          DATABASE_ID,
          TEAMS_COLLECTION_ID,
          data.teamId,
          {
            memberCount: team.memberCount + 1,
            updatedAt: new Date().toISOString()
          }
        );
      }
    }

    return member as TeamMember;
  }

  // Get team members
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const members = await databases.listDocuments(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.orderDesc('joinedAt')
      ]
    );

    return members.documents as TeamMember[];
  }

  // Remove team member
  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const members = await databases.listDocuments(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.equal('userId', userId)
      ]
    );

    if (members.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        members.documents[0].$id
      );

      // Update team member count
      const team = await this.getTeam(teamId);
      if (team) {
        await databases.updateDocument(
          DATABASE_ID,
          TEAMS_COLLECTION_ID,
          teamId,
          {
            memberCount: Math.max(0, team.memberCount - 1),
            updatedAt: new Date().toISOString()
          }
        );
      }
    }
  }

  // Check if user is team member
  static async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const members = await databases.listDocuments(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.equal('userId', userId),
        Query.equal('status', 'active')
      ]
    );

    return members.documents.length > 0;
  }

  // Get user's role in team
  static async getUserRole(teamId: string, userId: string): Promise<string | null> {
    const members = await databases.listDocuments(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.equal('userId', userId),
        Query.equal('status', 'active')
      ]
    );

    return members.documents.length > 0 ? members.documents[0].role : null;
  }
}

// Chat Services
export class ChatService {
  // Create a new channel
  static async createChannel(data: {
    teamId: string;
    name: string;
    description?: string;
    type: 'text' | 'voice' | 'announcement';
    isPrivate: boolean;
  }, userId: string): Promise<ChatChannel> {
    const channel = await databases.createDocument(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        createdBy: userId,
        messageCount: 0,
        createdAt: new Date().toISOString()
      }
    );

    return channel as ChatChannel;
  }

  // Get team channels
  static async getTeamChannels(teamId: string): Promise<ChatChannel[]> {
    const channels = await databases.listDocuments(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.orderAsc('createdAt')
      ]
    );

    return channels.documents as ChatChannel[];
  }

  // Send a message
  static async sendMessage(data: {
    channelId: string;
    teamId: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'system';
    attachments?: string;
    replyToId?: string;
  }, userId: string, userName: string, userAvatar?: string): Promise<ChatMessage> {
    const message = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        userId,
        userName,
        userAvatar: userAvatar || '',
        type: data.type || 'text',
        isEdited: false,
        createdAt: new Date().toISOString()
      }
    );

    // Update channel stats
    await databases.updateDocument(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      data.channelId,
      {
        messageCount: 0, // Will be calculated
        lastMessageAt: new Date().toISOString(),        lastMessageId: message.$id
      }
    );

    return message as unknown as ChatMessage;
  }

  // Get channel messages
  static async getChannelMessages(channelId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', channelId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    return messages.documents.reverse() as ChatMessage[]; // Reverse to show oldest first
  }

  // Edit a message
  static async editMessage(messageId: string, content: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      messageId,
      {
        content,
        isEdited: true,
        editedAt: new Date().toISOString()
      }
    );
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      messageId
    );
  }
}

// Invitation Services
export class InvitationService {
  // Create team invitation
  static async createInvitation(data: {
    teamId: string;
    teamName: string;
    invitedEmail: string;
    role: 'admin' | 'member';
    message?: string;
  }, inviterId: string, inviterName: string): Promise<TeamInvitation> {
    const token = this.generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const invitation = await databases.createDocument(
      DATABASE_ID,
      TEAM_INVITATIONS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        invitedBy: inviterId,
        inviterName,
        status: 'pending',
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      }
    );

    return invitation as TeamInvitation;
  }

  // Get user invitations
  static async getUserInvitations(userEmail: string): Promise<TeamInvitation[]> {
    const invitations = await databases.listDocuments(
      DATABASE_ID,
      TEAM_INVITATIONS_COLLECTION_ID,
      [
        Query.equal('invitedEmail', userEmail),
        Query.equal('status', 'pending'),
        Query.greaterThan('expiresAt', new Date().toISOString()),
        Query.orderDesc('createdAt')
      ]
    );

    return invitations.documents as TeamInvitation[];
  }

  // Accept invitation
  static async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await databases.getDocument(
      DATABASE_ID,
      TEAM_INVITATIONS_COLLECTION_ID,
      invitationId
    ) as TeamInvitation;

    // Add user to team
    await TeamService.addTeamMember({
      teamId: invitation.teamId,
      userId,
      userEmail: invitation.invitedEmail,
      userName: '', // Will be filled from user data
      role: invitation.role,
      status: 'active',
      invitedBy: invitation.invitedBy
    });

    // Update invitation status
    await databases.updateDocument(
      DATABASE_ID,
      TEAM_INVITATIONS_COLLECTION_ID,
      invitationId,
      {
        status: 'accepted',
        respondedAt: new Date().toISOString()
      }
    );
  }

  // Decline invitation
  static async declineInvitation(invitationId: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      TEAM_INVITATIONS_COLLECTION_ID,
      invitationId,
      {
        status: 'declined',
        respondedAt: new Date().toISOString()
      }
    );
  }

  // Generate unique invitation token
  private static generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}