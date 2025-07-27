import { getDatabases } from './appwrite';
import { ID, Query } from 'appwrite';
import { DATABASE_ID } from './appwrite';

const databases = getDatabases();

// Collection IDs
export const TEAMS_COLLECTION_ID = 'teams';
export const TEAM_MEMBERS_COLLECTION_ID = 'team_members';
export const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';
export const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';
export const MESSAGES_COLLECTION_ID = 'messages'; // Simple messages collection for team chat

// Team Functions
export async function createTeam(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}, userId: string, userName: string, userEmail?: string) {
  try {    const team = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',        owner: userId, // Changed to 'owner' for simplicity
        isPublic: data.isPublic || false,
        maxMembers: data.maxMembers || 50,
        memberCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );

    console.log('✅ Team document created with owner attribute:', team);// Add creator as admin
    await addTeamMember({
      teamId: team.$id,
      userId,
      userEmail: userEmail || '',
      userName,
      role: 'admin',
      status: 'active',
      invitedBy: userId
    });

    // Create default general channel
    await createChannel({
      teamId: team.$id,
      name: 'general',
      description: 'General discussion',
      type: 'text',
      isPrivate: false
    }, userId);

    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

export async function getUserTeams(userId: string) {
  try {
    // First check if userId is valid
    if (!userId || userId.trim() === '') {
      console.log('❌ No userId provided to getUserTeams');
      return [];
    }

    console.log('🔍 [getUserTeams] Fetching teams for user:', userId);
    console.log('🏢 [getUserTeams] Database:', DATABASE_ID);
    console.log('📋 [getUserTeams] Collection:', TEAMS_COLLECTION_ID);    // Try multiple queries to find teams - your existing teams might use different field names
    let teams: any[] = [];
    
    // 1. Try querying by 'owner' field (new teams created with createTeam)
    try {
      const ownerTeams = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [Query.equal('owner', [userId])]
      );
      teams = [...teams, ...ownerTeams.documents];
      console.log('📋 [getUserTeams] Found teams by owner field:', ownerTeams.documents.length);
    } catch (error) {
      console.log('⚠️ [getUserTeams] No teams found by owner field or field does not exist');
    }

    // 2. Try querying by 'ownerId' field (if you have existing teams with this field)
    try {
      const ownerIdTeams = await databases.listDocuments(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        [Query.equal('ownerId', [userId])]
      );
      // Only add teams that aren't already in our results
      const newTeams = ownerIdTeams.documents.filter(team => 
        !teams.some(existingTeam => existingTeam.$id === team.$id)
      );
      teams = [...teams, ...newTeams];
      console.log('📋 [getUserTeams] Found additional teams by ownerId field:', newTeams.length);
    } catch (error) {
      console.log('⚠️ [getUserTeams] No teams found by ownerId field or field does not exist');
    }

    console.log('✅ [getUserTeams] Total teams found:', teams.length);
    console.log('📋 [getUserTeams] Teams data:', teams);

    return teams;

  } catch (error: any) {
    console.error('❌ [getUserTeams] Error getting user teams:', error);
    console.error('❌ [getUserTeams] Error message:', error?.message);
    
    // If the error is about ownerId attribute, log it clearly
    if (error?.message?.includes('ownerId')) {
      console.error('� [getUserTeams] ownerId attribute issue - collection might be missing this field');
    }
    
    return [];
  }
}

export async function addTeamMember(data: {
  teamId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  invitedBy: string;
}) {
  try {
    const member = await databases.createDocument(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      ID.unique(),
      {
        teamId: data.teamId,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        role: data.role,
        status: data.status,
        invitedBy: data.invitedBy,
        invitedAt: new Date().toISOString(),
        joinedAt: data.status === 'active' ? new Date().toISOString() : undefined
      }
    );

    return member;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
}

export async function createChannel(data: {
  teamId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement';
  isPrivate: boolean;
}, userId: string) {
  try {
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

    return channel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
}

export async function getTeamChannels(teamId: string) {
  try {
    const channels = await databases.listDocuments(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.orderAsc('createdAt')
      ]
    );

    return channels.documents;
  } catch (error) {
    console.error('Error getting team channels:', error);
    return [];
  }
}

export async function sendMessage(data: {
  channelId: string;
  teamId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
}, userId: string, userName: string) {
  try {
    const message = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        userId,
        userName,
        type: data.type || 'text',
        isEdited: false,
        createdAt: new Date().toISOString()
      }
    );

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getChannelMessages(channelId: string, limit: number = 50) {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', channelId),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );

    return messages.documents.reverse(); // Show oldest first
  } catch (error) {
    console.error('Error getting channel messages:', error);
    return [];
  }
}

// Get team by ID with access control
export async function getTeamById(teamId: string, userId: string) {
  try {
    console.log('🔍 [Teams Service] Getting team by ID:', { teamId, userId });
    
    // Get the team document
    const team = await databases.getDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId
    );    console.log('📋 [Teams Service] Team data:', { 
      teamId: team.$id, 
      createdBy: team.createdBy,
      userId: team.userId,
      creator: team.creator,
      owner: team.owner,
      currentUserId: userId, 
      isPublic: team.isPublic,
      hasMembers: !!team.members,
      allFields: Object.keys(team), // Show all available fields
      sampleFieldValues: {
        // Let's see what fields actually contain values
        '$id': team.$id,
        'name': team.name,
        'description': team.description,
        '$createdAt': team.$createdAt,
        '$updatedAt': team.$updatedAt
      }
    });    // Check if user has access to this team
    let hasAccess = false;
    
    // Check if user is the creator/owner (prioritize 'owner' field since that's what createTeam stores)
    const creatorId = team.owner || team.userId || team.createdBy || team.creator;
    if (creatorId === userId) {
      hasAccess = true;
      console.log('✅ [Teams Service] Access granted: User is team creator/owner');
    }
    // Check if team has members array and user is in it
    else if (team.members && Array.isArray(team.members) && team.members.includes(userId)) {
      hasAccess = true;
      console.log('✅ [Teams Service] Access granted: User is in members list');
    }
    // Check if team is public (fallback for teams without members array)
    else if (team.isPublic) {
      hasAccess = true;
      console.log('✅ [Teams Service] Access granted: Team is public');
    }
    // If we can't determine creator and no members array, allow access for debugging
    else if (!creatorId && !team.members) {
      hasAccess = true;
      console.log('⚠️ [Teams Service] Access granted: No creator field found, allowing access for debugging');
    }
    
    if (!hasAccess) {
      console.log('❌ [Teams Service] Access denied for user:', userId);
      throw new Error('Access denied: User is not authorized to view this team');
    }
    
    console.log('✅ [Teams Service] Team found and access granted:', team.name);
    return team;
    
  } catch (error) {
    console.error('❌ [Teams Service] Error getting team:', error);
    throw error;
  }
}

// Get team members with user details
export async function getTeamMembers(teamId: string, userId: string) {
  try {
    console.log('🔍 [Teams Service] Getting team members:', { teamId, userId });
    
    // First verify user has access to the team
    const team = await getTeamById(teamId, userId);
      // Get all member IDs
    let memberIds: string[] = [];
    
    // Add members from the members array if it exists
    if (team.members && Array.isArray(team.members)) {
      memberIds = [...team.members];
    }    // Always include the team creator (prioritize 'owner' field since that's what createTeam stores)
    const creatorId = team.owner || team.userId || team.createdBy || team.creator;
    if (creatorId && !memberIds.includes(creatorId)) {
      memberIds.push(creatorId);
    }
    
    // If no members at all and no creator found, include the requesting user as owner
    if (memberIds.length === 0) {
      memberIds = [userId];
      console.log('⚠️ [Teams Service] No creator or members found, adding requesting user as owner');
    }    // For now, return basic member info
    // In a real implementation, you'd fetch user details from a users collection
    const members = memberIds.map((memberId, index) => ({
      $id: memberId,
      name: memberId === creatorId ? `Team Owner` : `Member ${index + 1}`,
      email: `user${memberId.slice(-4)}@example.com`,
      joinedAt: team.createdAt,
      role: memberId === creatorId ? 'owner' : 'member'
    }));
    
    console.log('✅ [Teams Service] Members found:', members);
    return members;
    
  } catch (error) {
    console.error('❌ [Teams Service] Error getting team members:', error);
    throw error;
  }
}

// Update team settings
export async function updateTeam(teamId: string, userId: string, updates: {
  name?: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}) {
  try {
    console.log('🔄 [Teams Service] Updating team:', { teamId, userId, updates });    // First verify user is the owner
    const team = await getTeamById(teamId, userId);
    
    // Check ownership (prioritize userId since that's in the database)
    const creatorId = team.userId || team.createdBy || team.creator || team.owner;
    if (creatorId !== userId) {
      throw new Error('Only team owners can update team settings');
    }
    
    // Update the team
    const updatedTeam = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId,
      updates
    );
    
    console.log('✅ [Teams Service] Team updated:', updatedTeam);
    return updatedTeam;
    
  } catch (error) {
    console.error('❌ [Teams Service] Error updating team:', error);
    throw error;
  }
}

// Delete team
export async function deleteTeam(teamId: string, userId: string) {
  try {
    console.log('🗑️ [Teams Service] Deleting team:', { teamId, userId });
      // First verify user is the owner
    const team = await getTeamById(teamId, userId);
    
    // Check ownership (prioritize userId since that's in the database)
    const creatorId = team.userId || team.createdBy || team.creator || team.owner;
    if (creatorId !== userId) {
      throw new Error('Only team owners can delete teams');
    }
    
    // Delete the team
    await databases.deleteDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId
    );
    
    console.log('✅ [Teams Service] Team deleted successfully');
    
  } catch (error) {
    console.error('❌ [Teams Service] Error deleting team:', error);
    throw error;
  }
}

// TEMPORARY: Fix existing teams that don't have proper creator fields
export async function fixTeamOwnership(teamId: string, userId: string) {
  try {
    console.log('🔧 [Teams Service] Fixing team ownership:', { teamId, userId });
    
    const updatedTeam = await databases.updateDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      teamId,
      {
        userId: userId,
        createdBy: userId,
        owner: userId
      }
    );
    
    console.log('✅ [Teams Service] Team ownership fixed:', updatedTeam);
    return updatedTeam;
    
  } catch (error) {
    console.error('❌ [Teams Service] Error fixing team ownership:', error);
    throw error;
  }
}

// UTILITY: Quick fix for team ownership
export async function fixAllTeamOwnership(userId: string) {
  try {
    console.log('🔧 [Fix Ownership] Starting to fix all teams for user:', userId);
    
    // Get all teams this user can access
    const userTeams = await getUserTeams(userId);
    console.log('📋 [Fix Ownership] Found teams to fix:', userTeams.length);
    
    const results: Array<{
      teamId: string;
      teamName: string;
      status: 'fixed' | 'failed';
      error?: string;
    }> = [];
    
    for (const team of userTeams) {
      try {
        console.log('🔧 [Fix Ownership] Fixing team:', team.name, team.$id);
        
        const updatedTeam = await databases.updateDocument(
          DATABASE_ID,
          TEAMS_COLLECTION_ID,
          team.$id,
          {
            owner: userId,
            ownerId: userId, // Add both fields for compatibility
            userId: userId,
            createdBy: userId
          }
        );
        
        console.log('✅ [Fix Ownership] Team fixed:', team.name);
        results.push({ 
          teamId: team.$id, 
          teamName: team.name, 
          status: 'fixed' 
        });
        
      } catch (error) {
        console.error('❌ [Fix Ownership] Error fixing team:', team.name, error);
        results.push({ 
          teamId: team.$id, 
          teamName: team.name, 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log('✅ [Fix Ownership] All teams processed:', results);
    return results;
    
  } catch (error) {
    console.error('❌ [Fix Ownership] Error in bulk fix:', error);
    throw error;
  }
}

// TEAM CHAT FUNCTIONS - Simplified and consistent

// Send team message
export async function sendTeamMessage(teamId: string, userId: string, content: string) {
  try {
    console.log('� [Teams Service] Sending team message:', { teamId, userId, content });
    
    // First verify user has access to the team
    await getTeamById(teamId, userId);      // Create message document with correct structure (including channelId)
    const messageData = {
      channelId: 'general', // Use general channel for team messages
      teamId,
      userId,
      content: content.trim(),
      userName: `User ${userId.slice(-4)}`, // You can enhance this with real user names later
      type: 'text', // Match the type field from sendMessage function
      isEdited: false, // Match the isEdited field from sendMessage function
      createdAt: new Date().toISOString()
    };
    
    console.log('� [Teams Service] Creating message with data:', messageData);
      const message = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID, // Use chat_messages collection
      ID.unique(),
      messageData
    );
    
    console.log('✅ [Teams Service] Message sent successfully:', message.$id);
    return message;
    
  } catch (error) {
    console.error('❌ [Teams Service] Error sending message:', error);
    
    // Provide helpful error if messages collection doesn't exist
    if (error instanceof Error && error.message?.includes('Collection with the requested ID could not be found')) {
      throw new Error('Messages collection not found. Please create the "messages" collection in your Appwrite database with the following attributes: teamId (string), userId (string), content (string), userName (string), createdAt (string), updatedAt (string)');
    }
    
    throw error;
  }
}

// Get team messages
export async function getTeamMessages(teamId: string, userId: string) {
  try {
    console.log('💬 [Teams Service] Getting team messages:', { teamId, userId });
    
    // First verify user has access to the team
    await getTeamById(teamId, userId);    // Get messages for this team with consistent field names
    const messages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID, // Use chat_messages collection
      [
        Query.equal('teamId', teamId), // Keep teamId query for now
        Query.orderDesc('createdAt'), // Use createdAt instead of $createdAt for consistency
        Query.limit(50)
      ]
    );
    
    console.log('✅ [Teams Service] Messages retrieved:', messages.documents.length);
    
    // Return messages in chronological order (oldest first for chat display)
    return messages.documents.reverse();
    
  } catch (error) {
    console.error('❌ [Teams Service] Error getting messages:', error);
    
    // Return empty array if messages collection doesn't exist yet
    if (error instanceof Error && error.message?.includes('Collection with the requested ID could not be found')) {
      console.log('📝 [Teams Service] Messages collection not found, returning empty array');
      return [];
    }
    
    throw error;
  }
}

// Debug function to test message system
export async function debugChatSystem(teamId: string, userId: string) {
  try {
    console.log('🔍 [Debug] Testing chat system for:', { teamId, userId });
    
    // 1. Test team access
    console.log('1️⃣ Testing team access...');
    const team = await getTeamById(teamId, userId);
    console.log('✅ Team access granted:', team.name);
    
    // 2. Test sending a message
    console.log('2️⃣ Testing message sending...');
    const testMessage = await sendTeamMessage(teamId, userId, 'Test message from debug function');
    console.log('✅ Test message sent:', testMessage.$id);
    
    // 3. Test retrieving messages
    console.log('3️⃣ Testing message retrieval...');
    const messages = await getTeamMessages(teamId, userId);
    console.log('✅ Messages retrieved:', messages.length);
    
    return {
      teamAccess: true,
      messageSent: true,
      messagesRetrieved: messages.length,
      testMessageId: testMessage.$id
    };
    
  } catch (error) {
    console.error('❌ [Debug] Chat system test failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      teamAccess: false,
      messageSent: false,
      messagesRetrieved: 0
    };
  }
}

// SIMPLIFIED TEAM CHAT FUNCTIONS (Alternative approach)

// Send simple team message (works with existing chat_messages structure)
export async function sendSimpleTeamMessage(teamId: string, userId: string, content: string) {
  try {    console.log('📤 [Simple Chat] Sending team message:', { teamId, userId, content });
    
    // First verify user has access to the team
    console.log('📤 [Simple Chat] Verifying team access...');
    await getTeamById(teamId, userId);
    console.log('✅ [Simple Chat] Team access verified');
    
    // Create message using your existing sendMessage function structure
    const messageData = {
      channelId: `team_${teamId}`, // Create a virtual channel ID for the team
      teamId: teamId,
      content: content.trim(),
      type: 'text' as const // Fix TypeScript type error
    };
    
    console.log('📤 [Simple Chat] Message data prepared:', messageData);
    
    // Use your existing sendMessage function
    const message = await sendMessage(messageData, userId, `User ${userId.slice(-4)}`);
    
    console.log('✅ [Simple Chat] Message sent successfully:', message.$id);
    console.log('📝 [Simple Chat] Full message object:', message);
    return message;
    
  } catch (error) {
    console.error('❌ [Simple Chat] Error sending message:', error);
    throw error;
  }
}

// Get simple team messages (works with existing chat_messages structure)
export async function getSimpleTeamMessages(teamId: string, userId: string) {
  try {
    console.log('💬 [Simple Chat] Getting team messages:', { teamId, userId });
    
    // First verify user has access to the team
    console.log('💬 [Simple Chat] Verifying team access...');
    await getTeamById(teamId, userId);
    console.log('✅ [Simple Chat] Team access verified');
    
    // Use your existing getChannelMessages function with virtual channel ID
    const channelId = `team_${teamId}`;
    console.log('💬 [Simple Chat] Querying messages for channelId:', channelId);
    
    const messages = await getChannelMessages(channelId, 50);
    
    console.log('✅ [Simple Chat] Messages retrieved:', messages.length);
    console.log('📝 [Simple Chat] Message data:', messages);
    
    return messages;
    
  } catch (error) {
    console.error('❌ [Simple Chat] Error getting messages:', error);
    console.error('❌ [Simple Chat] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

// DIRECT MESSAGE TEST FUNCTION (for debugging)
export async function testDirectMessage(teamId: string, userId: string) {
  try {
    console.log('🧪 [Test] Direct message test starting...', { teamId, userId });
    
    // Test 1: Verify team access
    console.log('1️⃣ Testing team access...');
    const team = await getTeamById(teamId, userId);
    console.log('✅ Team access OK:', team.name);
    
    // Test 2: Try direct database write
    console.log('2️⃣ Testing direct database write...');
    const directMessage = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        channelId: `test_${teamId}`,
        teamId: teamId,
        userId: userId,
        userName: `TestUser_${userId.slice(-4)}`,
        content: `Direct test message ${new Date().toLocaleTimeString()}`,
        type: 'text',
        isEdited: false,
        createdAt: new Date().toISOString()
      }
    );
    console.log('✅ Direct message created:', directMessage.$id);
    
    // Test 3: Try to retrieve the message
    console.log('3️⃣ Testing message retrieval...');
    const retrievedMessages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', `test_${teamId}`),
        Query.orderDesc('createdAt'),
        Query.limit(10)
      ]
    );
    console.log('✅ Messages retrieved:', retrievedMessages.documents.length);
    
    return {
      success: true,
      teamAccess: true,
      messageCreated: true,
      messageId: directMessage.$id,
      messagesFound: retrievedMessages.documents.length,
      allMessages: retrievedMessages.documents
    };
    
  } catch (error) {
    console.error('❌ [Test] Direct message test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      teamAccess: false,
      messageCreated: false,
      messagesFound: 0
    };
  }
}

// UNIFIED TEAM CHAT FUNCTIONS (matches debug that works)

// Send unified team message (using the same approach as debug that works)
export async function sendUnifiedTeamMessage(teamId: string, userId: string, content: string) {
  try {
    console.log('🚀 [Unified Chat] Sending team message:', { teamId, userId, content });
    
    // First verify user has access to the team
    await getTeamById(teamId, userId);
    
    // Use the approach that definitely works from debugChatSystem
    const messageData = {
      // Store BOTH channel patterns for maximum compatibility
      channelId: 'general', // For teamId-based retrieval
      // Also add the team prefix to channelId for backwards compatibility
      teamChannelId: `team_${teamId}`, 
      teamId,
      userId,
      content: content.trim(),
      userName: `User ${userId.slice(-4)}`,
      type: 'text',
      isEdited: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('🚀 [Unified Chat] Creating message with data:', messageData);
    
    const message = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      ID.unique(),
      messageData
    );
    
    console.log('✅ [Unified Chat] Message sent successfully:', message.$id);
    return message;
    
  } catch (error) {
    console.error('❌ [Unified Chat] Error sending message:', error);
    console.error('❌ [Unified Chat] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Get unified team messages (using the same approach as debug that works)
export async function getUnifiedTeamMessages(teamId: string, userId: string) {
  try {
    console.log('📥 [Unified Chat] Getting team messages:', { teamId, userId });
    
    // First verify user has access to the team
    await getTeamById(teamId, userId);
    
    // First try by teamId (which should work based on debug testing)
    const messagesByTeamId = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('teamId', teamId), // Query by teamId like in debugChatSystem
        Query.orderDesc('createdAt'),
        Query.limit(50)
      ]
    );
    
    console.log('📥 [Unified Chat] Messages by teamId:', messagesByTeamId.documents.length);
    
    // If we found messages, return them
    if (messagesByTeamId.documents.length > 0) {
      console.log('✅ [Unified Chat] Messages found by teamId query');
      return messagesByTeamId.documents.reverse(); // Return in chronological order
    }
    
    // Otherwise, try by channelId = team_${teamId} (which is used by sendSimpleTeamMessage)
    console.log('📥 [Unified Chat] Trying by channelId = team_${teamId}...');
    const messagesByChannel = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', `team_${teamId}`),
        Query.orderDesc('createdAt'),
        Query.limit(50)
      ]
    );
    
    console.log('📥 [Unified Chat] Messages by channelId=team_X:', messagesByChannel.documents.length);
    
    return messagesByChannel.documents.reverse(); // Return in chronological order
    
  } catch (error) {
    console.error('❌ [Unified Chat] Error getting messages:', error);
    return [];
  }
}

// DEBUG: Check what messages exist in database
export async function debugMessageStorage(teamId: string, userId: string) {
  try {
    console.log('🔍 [Debug Messages] Checking message storage for team:', teamId);
    
    // First verify team access
    await getTeamById(teamId, userId);
    
    // Check different query patterns to see where messages might be stored
    console.log('1️⃣ [Debug Messages] Checking messages by teamId...');
    const messagesByTeamId = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('teamId', teamId),
        Query.orderDesc('createdAt'),
        Query.limit(100)
      ]
    );
    console.log('📝 [Debug Messages] Messages by teamId:', messagesByTeamId.documents.length, messagesByTeamId.documents);
    
    console.log('2️⃣ [Debug Messages] Checking messages by channelId = general...');
    const messagesByChannelGeneral = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', 'general'),
        Query.orderDesc('createdAt'),
        Query.limit(100)
      ]
    );
    console.log('📝 [Debug Messages] Messages by channelId=general:', messagesByChannelGeneral.documents.length, messagesByChannelGeneral.documents);
    
    console.log('3️⃣ [Debug Messages] Checking messages by channelId = team_${teamId}...');
    const messagesByChannelTeam = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', `team_${teamId}`),
        Query.orderDesc('createdAt'),
        Query.limit(100)
      ]
    );
    console.log('📝 [Debug Messages] Messages by channelId=team_X:', messagesByChannelTeam.documents.length, messagesByChannelTeam.documents);
    
    console.log('4️⃣ [Debug Messages] Getting ALL messages in collection (last 20)...');
    const allMessages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.orderDesc('createdAt'),
        Query.limit(20)
      ]
    );
    console.log('📝 [Debug Messages] All recent messages:', allMessages.documents.length, allMessages.documents);
    
    return {
      teamId,
      messagesByTeamId: messagesByTeamId.documents.length,
      messagesByChannelGeneral: messagesByChannelGeneral.documents.length,
      messagesByChannelTeam: messagesByChannelTeam.documents.length,
      allRecentMessages: allMessages.documents.length,
      sampleMessage: allMessages.documents[0] || null
    };
    
  } catch (error) {
    console.error('❌ [Debug Messages] Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}