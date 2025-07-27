import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';
const TEAM_MEMBERS_COLLECTION_ID = 'team_members';
const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';

// NEW CLEAN TEAM CREATION FUNCTION - USES OWNER ATTRIBUTE
export async function createTeamNew(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}, userId: string, userName: string, userEmail?: string) {
    console.log('🔥🔥🔥 NEW createTeamNew function called!');
  console.log('📝 Data received:', data);
  console.log('👤 User ID:', userId);
  console.log('👤 User Name:', userName);
  console.log('📧 User Email:', userEmail);
  
  // Check if userId is valid
  if (!userId || userId === 'undefined') {
    throw new Error('User ID is required but was undefined. Please ensure user is properly authenticated.');
  }
  
  const teamPayload = {
    name: data.name,
    description: data.description || '',
    ownerId: userId, // ✅ CHANGED BACK TO OWNERID - YOUR COLLECTION EXPECTS THIS!
    isPublic: data.isPublic || false,
    maxMembers: data.maxMembers || 50,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('📦 Payload with OWNERID attribute:', teamPayload);
  console.log('🎯 Collection:', TEAMS_COLLECTION_ID);
  console.log('🏢 Database:', DATABASE_ID);
  
  try {
    console.log('🚀 Creating team document...');
    
    const team = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      teamPayload
    );
    
    console.log('✅ Team created successfully with owner attribute:', team);
    
    // Add creator as admin member
    try {
      console.log('👥 Adding creator as team member...');
      await databases.createDocument(
        DATABASE_ID,
        TEAM_MEMBERS_COLLECTION_ID,
        ID.unique(),
        {
          teamId: team.$id,
          userId,
          userEmail: userEmail || '',
          userName,
          role: 'admin',
          status: 'active',
          invitedBy: userId,
          invitedAt: new Date().toISOString(),
          joinedAt: new Date().toISOString()
        }
      );
      console.log('✅ Team member added successfully');
    } catch (memberError) {
      console.log('⚠️ Team created but member addition failed:', memberError);
    }
    
    // Create default general channel
    try {
      console.log('💬 Creating default channel...');
      await databases.createDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        ID.unique(),
        {
          teamId: team.$id,
          name: 'general',
          description: 'General discussion',
          type: 'text',
          isPrivate: false,
          createdBy: userId,
          messageCount: 0,
          createdAt: new Date().toISOString()
        }
      );
      console.log('✅ Default channel created successfully');
    } catch (channelError) {
      console.log('⚠️ Team created but channel creation failed:', channelError);
    }
    
    return team;
    
  } catch (error) {
    console.error('❌ Team creation failed:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    throw error;
  }
}