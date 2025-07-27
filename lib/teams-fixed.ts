import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';

// FINAL FIXED TEAM CREATION - DEFINITELY USES OWNERID
export async function createTeamFixed(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}, userId: string, userName: string, userEmail?: string) {
  
  console.log('🔥 FINAL FIXED createTeamFixed function called!');
  console.log('👤 User ID:', userId);
  
  if (!userId) {
    throw new Error('User ID is required but was undefined');
  }
  
  // FINAL PAYLOAD WITH OWNERID
  const finalPayload = {
    name: data.name,
    description: data.description || '',
    ownerId: userId, // ✅ DEFINITELY OWNERID!
    isPublic: data.isPublic || false,
    maxMembers: data.maxMembers || 50,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('📦 FINAL payload with ownerId:', finalPayload);
  console.log('🔑 Verifying ownerId exists:', 'ownerId' in finalPayload);
  console.log('🔑 ownerId value:', finalPayload.ownerId);
  
  try {
    const team = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      finalPayload
    );
      console.log('✅ SUCCESS: Team created with ownerId!', team);
    
    // Create default general channel
    try {
      console.log('💬 Creating default channel...');
      const { createDefaultChannel } = await import('@/lib/chat-service');
      await createDefaultChannel(team.$id, userId);
      console.log('✅ Default channel created successfully');
    } catch (channelError) {
      console.log('⚠️ Team created but channel creation failed:', channelError);
      // Don't throw error, team creation was successful
    }
    
    return team;
    
  } catch (error: any) {
    console.error('❌ FAILED: Team creation error:', error);
    throw error;
  }
}