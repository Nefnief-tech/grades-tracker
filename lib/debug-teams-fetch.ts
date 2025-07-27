import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';

// Debug function to check teams collection
export async function debugTeamsCollection(userId?: string) {
  console.log('🔍 DEBUG: Checking teams collection...');
  console.log('🏢 Database ID:', DATABASE_ID);
  console.log('📋 Collection ID:', TEAMS_COLLECTION_ID);
  
  try {
    // Get all teams first
    console.log('📋 Fetching all teams...');
    const allTeams = await databases.listDocuments(
      DATABASE_ID,
      TEAMS_COLLECTION_ID,
      []
    );
    
    console.log('✅ Total teams in collection:', allTeams.documents.length);
    console.log('📋 All teams:', allTeams.documents);
    
    if (allTeams.documents.length > 0) {
      console.log('🔑 Sample team structure:', allTeams.documents[0]);
      console.log('🔑 Available attributes:', Object.keys(allTeams.documents[0]));
    }
    
    // If userId provided, try to get user's teams
    if (userId) {
      console.log('👤 Checking teams for user:', userId);
      
      // Try different possible owner field names
      const possibleOwnerFields = ['ownerId', 'owner', 'createdBy'];
      
      for (const field of possibleOwnerFields) {
        try {
          console.log(`🔍 Trying field: ${field}`);
          const userTeams = await databases.listDocuments(
            DATABASE_ID,
            TEAMS_COLLECTION_ID,
            [Query.equal(field, [userId])]
          );
          console.log(`✅ Found ${userTeams.documents.length} teams using ${field}`);
          if (userTeams.documents.length > 0) {
            return { field, teams: userTeams.documents };
          }
        } catch (error) {
          console.log(`❌ Field ${field} doesn't exist or query failed:`, error);
        }
      }
    }
    
    return { allTeams: allTeams.documents };
    
  } catch (error) {
    console.error('❌ Error debugging teams collection:', error);
    console.error('Error details:', error);
    return { error };
  }
}

// Simple function to get user teams with debugging
export async function getUserTeamsDebug(userId: string) {
  console.log('🔍 getUserTeamsDebug called for user:', userId);
  
  const debugResult = await debugTeamsCollection(userId);
  
  if (debugResult.teams) {
    console.log(`✅ Found teams using ${debugResult.field}:`, debugResult.teams);
    return debugResult.teams;
  }
  
  if (debugResult.allTeams) {
    console.log('📋 Returning all teams (no user-specific teams found):', debugResult.allTeams);
    return debugResult.allTeams;
  }
  
  console.log('❌ No teams found');
  return [];
}