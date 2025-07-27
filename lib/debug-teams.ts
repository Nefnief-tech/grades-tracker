import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';

// Debug function to trace team creation
export async function debugCreateTeam(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}, userId: string, userName: string, userEmail?: string) {
  console.log('🔍 Debug: Starting team creation');
  console.log('📝 Data received:', data);
  console.log('👤 User ID:', userId);
  console.log('👤 User Name:', userName);
  console.log('📧 User Email:', userEmail);

  const payload = {
    name: data.name,
    description: data.description || '',
    owner: userId, // Using 'owner' attribute
    isPublic: data.isPublic || false,
    maxMembers: data.maxMembers || 50,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('📦 Payload being sent:', payload);
  console.log('🎯 Target collection: teams');
  console.log('🏗️ Database ID:', DATABASE_ID);
  console.log('📋 Collection ID:', TEAMS_COLLECTION_ID);

  try {
    const team = await databases.createDocument(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      ID.unique(),
      payload
    );

    console.log('✅ Team created successfully:', team);
    return team;
  } catch (error: any) {
    console.error('❌ Team creation failed:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error type:', error.type);
    throw error;
  }
}