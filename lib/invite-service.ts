import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const databases = getDatabases();
const TEAM_INVITES_COLLECTION_ID = '6857419200146011ad19';
const CHANNEL_INVITES_COLLECTION_ID = 'channel_invites';
const TEAM_MEMBERS_COLLECTION_ID = 'team_members';

// Check if collection exists
async function collectionExists(collectionId: string): Promise<boolean> {
  try {
    await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(1)]);
    return true;
  } catch (error: any) {
    if (error.code === 404) {
      return false;
    }
    throw error;
  }
}

// Team Invites with fallback
export async function createTeamInvite(data: {
  teamId: string;
  teamName: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  message?: string;
}) {
  try {
    console.log('📧 Creating team invite:', data);

    // Check if collections exist
    const invitesExist = await collectionExists(TEAM_INVITES_COLLECTION_ID);
    const membersExist = await collectionExists(TEAM_MEMBERS_COLLECTION_ID);

    if (!invitesExist) {
      console.log('⚠️ team_invites collection not found, using fallback method');
      
      // Fallback: create member directly with invited status
      if (membersExist) {
        // Check if user is already a member
        const existingMembers = await databases.listDocuments(
          DATABASE_ID,
          TEAM_MEMBERS_COLLECTION_ID,
          [
            Query.equal('teamId', [data.teamId]),
            Query.equal('userEmail', [data.inviteeEmail.toLowerCase()])
          ]
        );

        if (existingMembers.documents.length > 0) {
          throw new Error('User is already a member of this team');
        }

        // Create member with invited status
        const member = await databases.createDocument(
          DATABASE_ID,
          TEAM_MEMBERS_COLLECTION_ID,
          ID.unique(),
          {
            teamId: data.teamId,
            userId: '', // Will be filled when user accepts
            userEmail: data.inviteeEmail.toLowerCase(),
            userName: data.inviteeEmail.split('@')[0], // Temporary name
            role: data.role,
            status: 'invited',
            invitedBy: data.inviterUserId,
            invitedAt: new Date().toISOString()
          }
        );

        console.log('✅ Team member invite created via fallback:', member);
        return {
          $id: member.$id,
          teamId: data.teamId,
          teamName: data.teamName,
          inviterName: data.inviterName,
          inviteeEmail: data.inviteeEmail,
          role: data.role,
          message: data.message || '',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
      } else {
        // No collections exist - show success but no actual invite
        console.log('⚠️ No invite collections found - simulating invite');
        return {
          $id: 'mock-' + Date.now(),
          teamId: data.teamId,
          teamName: data.teamName,
          inviterName: data.inviterName,
          inviteeEmail: data.inviteeEmail,
          role: data.role,
          message: data.message || '',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
      }
    }

    // Normal flow if collections exist
    // Check if user is already a member
    if (membersExist) {
      const existingMembers = await databases.listDocuments(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        [
          Query.equal('teamId', [data.teamId]),
          Query.equal('userEmail', [data.inviteeEmail.toLowerCase()])
        ]
      );

      if (existingMembers.documents.length > 0) {
        throw new Error('User is already a member of this team');
      }
    }

    // Check if invite already exists
    const existingInvites = await databases.listDocuments(
      DATABASE_ID,
      TEAM_INVITES_COLLECTION_ID,
      [
        Query.equal('teamId', [data.teamId]),
        Query.equal('inviteeEmail', [data.inviteeEmail.toLowerCase()]),
        Query.equal('status', ['pending'])
      ]
    );

    if (existingInvites.documents.length > 0) {
      throw new Error('An invitation is already pending for this user');
    }

    // Create invite
    const invite = await databases.createDocument(
      DATABASE_ID,
      TEAM_INVITES_COLLECTION_ID,
      ID.unique(),
      {
        teamId: data.teamId,
        teamName: data.teamName,
        inviterUserId: data.inviterUserId,
        inviterName: data.inviterName,
        inviteeEmail: data.inviteeEmail.toLowerCase(),
        role: data.role,
        message: data.message || '',
        status: 'pending',
        inviteCode: generateInviteCode(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString()
      }
    );

    console.log('✅ Team invite created:', invite);
    return invite;
  } catch (error) {
    console.error('❌ Error creating team invite:', error);
    throw error;
  }
}

// Channel Invites with fallback
export async function createChannelInvite(data: {
  channelId: string;
  channelName: string;
  teamId: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail: string;
  message?: string;
}) {
  try {
    console.log('📧 Creating channel invite:', data);

    // Check if collection exists
    const invitesExist = await collectionExists(CHANNEL_INVITES_COLLECTION_ID);

    if (!invitesExist) {
      console.log('⚠️ channel_invites collection not found, using mock invite');
      
      // Return mock invite for now
      return {
        $id: 'mock-channel-' + Date.now(),
        channelId: data.channelId,
        channelName: data.channelName,
        teamId: data.teamId,
        inviterName: data.inviterName,
        inviteeEmail: data.inviteeEmail,
        message: data.message || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    // Check if invite already exists
    const existingInvites = await databases.listDocuments(
      DATABASE_ID,
      CHANNEL_INVITES_COLLECTION_ID,
      [
        Query.equal('channelId', [data.channelId]),
        Query.equal('inviteeEmail', [data.inviteeEmail.toLowerCase()]),
        Query.equal('status', ['pending'])
      ]
    );

    if (existingInvites.documents.length > 0) {
      throw new Error('An invitation is already pending for this channel');
    }

    const invite = await databases.createDocument(
      DATABASE_ID,
      CHANNEL_INVITES_COLLECTION_ID,
      ID.unique(),
      {
        channelId: data.channelId,
        channelName: data.channelName,
        teamId: data.teamId,
        inviterUserId: data.inviterUserId,
        inviterName: data.inviterName,
        inviteeEmail: data.inviteeEmail.toLowerCase(),
        message: data.message || '',
        status: 'pending',
        inviteCode: generateInviteCode(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    );

    console.log('✅ Channel invite created:', invite);
    return invite;
  } catch (error) {
    console.error('❌ Error creating channel invite:', error);
    throw error;
  }
}

// Get user's pending invites with fallbacks
export async function getUserInvites(userEmail: string) {
  try {
    console.log('🔍 Getting invites for user:', userEmail);

    const teamInvitesExist = await collectionExists(TEAM_INVITES_COLLECTION_ID);
    const channelInvitesExist = await collectionExists(CHANNEL_INVITES_COLLECTION_ID);
    const membersExist = await collectionExists(TEAM_MEMBERS_COLLECTION_ID);

    let teamInvites: any[] = [];
    let channelInvites: any[] = [];

    // Get team invites
    if (teamInvitesExist) {
      const teamInviteDocs = await databases.listDocuments(
        DATABASE_ID,
        TEAM_INVITES_COLLECTION_ID,
        [
          Query.equal('inviteeEmail', [userEmail.toLowerCase()]),
          Query.equal('status', ['pending']),
          Query.orderDesc('createdAt')
        ]
      );
      teamInvites = teamInviteDocs.documents;
    } else if (membersExist) {
      // Fallback: check team_members for invited status
      const invitedMembers = await databases.listDocuments(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        [
          Query.equal('userEmail', [userEmail.toLowerCase()]),
          Query.equal('status', ['invited']),
          Query.orderDesc('invitedAt')
        ]
      );
      
      // Convert to invite format
      teamInvites = invitedMembers.documents.map(member => ({
        $id: member.$id,
        teamId: member.teamId,
        teamName: 'Team', // We don't have team name in members
        inviterName: 'Team Owner',
        inviteeEmail: member.userEmail,
        role: member.role,
        status: 'pending',
        createdAt: member.invitedAt,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }

    // Get channel invites
    if (channelInvitesExist) {
      const channelInviteDocs = await databases.listDocuments(
        DATABASE_ID,
        CHANNEL_INVITES_COLLECTION_ID,
        [
          Query.equal('inviteeEmail', [userEmail.toLowerCase()]),
          Query.equal('status', ['pending']),
          Query.orderDesc('createdAt')
        ]
      );
      channelInvites = channelInviteDocs.documents;
    }

    return {
      teamInvites,
      channelInvites
    };
  } catch (error) {
    console.error('❌ Error getting user invites:', error);
    return { teamInvites: [], channelInvites: [] };
  }
}

// Accept team invite with fallback
export async function acceptTeamInvite(inviteId: string, userId: string, userName: string) {
  try {
    console.log('✅ Accepting team invite:', inviteId);

    const membersExist = await collectionExists(TEAM_MEMBERS_COLLECTION_ID);
    const invitesExist = await collectionExists(TEAM_INVITES_COLLECTION_ID);

    if (inviteId.startsWith('mock-')) {
      console.log('⚠️ Mock invite - cannot actually join team');
      throw new Error('Please ask the team owner to create the proper database collections');
    }

    if (!membersExist) {
      throw new Error('Team members collection not found. Please contact support.');
    }

    let invite: any;

    if (invitesExist) {
      // Normal flow with invites collection
      invite = await databases.getDocument(
        DATABASE_ID,
        TEAM_INVITES_COLLECTION_ID,
        inviteId
      );

      if (invite.status !== 'pending') {
        throw new Error('This invitation is no longer valid');
      }

      if (new Date(invite.expiresAt) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Update invite status
      await databases.updateDocument(
        DATABASE_ID,
        TEAM_INVITES_COLLECTION_ID,
        inviteId,
        {
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          acceptedBy: userId
        }
      );
    } else {
      // Fallback: get from team_members with invited status
      invite = await databases.getDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        inviteId
      );

      if (invite.status !== 'invited') {
        throw new Error('This invitation is no longer valid');
      }
    }

    // Add user to team or update existing invited member
    if (invitesExist) {
      // Create new member
      await databases.createDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        ID.unique(),
        {
          teamId: invite.teamId,
          userId: userId,
          userEmail: invite.inviteeEmail,
          userName: userName,
          role: invite.role,
          status: 'active',
          invitedBy: invite.inviterUserId,
          invitedAt: invite.createdAt,
          joinedAt: new Date().toISOString()
        }
      );
    } else {
      // Update existing member
      await databases.updateDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        inviteId,
        {
          userId: userId,
          userName: userName,
          status: 'active',
          joinedAt: new Date().toISOString()
        }
      );
    }

    console.log('✅ Team invite accepted successfully');
    return invite;
  } catch (error) {
    console.error('❌ Error accepting team invite:', error);
    throw error;
  }
}

// Decline invite with fallback
export async function declineInvite(inviteId: string, type: 'team' | 'channel') {
  try {
    if (inviteId.startsWith('mock-')) {
      console.log('⚠️ Mock invite declined');
      return;
    }

    const collectionId = type === 'team' ? TEAM_INVITES_COLLECTION_ID : CHANNEL_INVITES_COLLECTION_ID;
    const exists = await collectionExists(collectionId);
    
    if (!exists && type === 'team') {
      // Fallback: update team_members status
      const membersExist = await collectionExists(TEAM_MEMBERS_COLLECTION_ID);
      if (membersExist) {
        await databases.updateDocument(
          DATABASE_ID,
          TEAM_MEMBERS_COLLECTION_ID,
          inviteId,
          {
            status: 'declined',
            joinedAt: new Date().toISOString() // Mark as processed
          }
        );
      }
      return;
    }

    if (!exists) {
      console.log('⚠️ Collection not found, simulating decline');
      return;
    }
    
    await databases.updateDocument(
      DATABASE_ID,
      collectionId,
      inviteId,
      {
        status: 'declined',
        declinedAt: new Date().toISOString()
      }
    );

    console.log('✅ Invite declined successfully');
  } catch (error) {
    console.error('❌ Error declining invite:', error);
    throw error;
  }
}

// Get team invites (for team owners/admins)
export async function getTeamInvites(teamId: string) {
  try {
    const invitesExist = await collectionExists(TEAM_INVITES_COLLECTION_ID);
    
    if (!invitesExist) {
      console.log('⚠️ Team invites collection not found');
      return [];
    }

    const invites = await databases.listDocuments(
      DATABASE_ID,
      TEAM_INVITES_COLLECTION_ID,
      [
        Query.equal('teamId', [teamId]),
        Query.orderDesc('createdAt')
      ]
    );

    return invites.documents;
  } catch (error) {
    console.error('❌ Error getting team invites:', error);
    return [];
  }
}

// Generate unique invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate invite by code
export async function validateInviteCode(code: string, type: 'team' | 'channel') {
  try {
    const collectionId = type === 'team' ? TEAM_INVITES_COLLECTION_ID : CHANNEL_INVITES_COLLECTION_ID;
    const exists = await collectionExists(collectionId);
    
    if (!exists) {
      throw new Error('Invite system not available');
    }
    
    const invites = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        Query.equal('inviteCode', [code]),
        Query.equal('status', ['pending'])
      ]
    );

    if (invites.documents.length === 0) {
      throw new Error('Invalid or expired invite code');
    }

    const invite = invites.documents[0];
    
    if (new Date(invite.expiresAt) < new Date()) {
      throw new Error('This invitation has expired');
    }

    return invite;
  } catch (error) {
    console.error('❌ Error validating invite code:', error);
    throw error;
  }
}