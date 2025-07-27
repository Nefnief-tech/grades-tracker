import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';

const databases = getDatabases();

// Collection IDs
export const TEAMS_COLLECTION_ID = 'teams';
export const TEAM_MEMBERS_COLLECTION_ID = 'team_members';
export const TEAM_INVITES_COLLECTION_ID = 'team_invites';
export const CHANNEL_INVITES_COLLECTION_ID = 'channel_invites';
export const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';
export const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';

// Create team_invites collection
async function createTeamInvitesCollection() {
  try {
    console.log('🔧 Creating team_invites collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      TEAM_INVITES_COLLECTION_ID,
      'Team Invites',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    const attributes = [
      { key: 'teamId', type: 'string', size: 50, required: true },
      { key: 'teamName', type: 'string', size: 100, required: true },
      { key: 'inviterUserId', type: 'string', size: 50, required: true },
      { key: 'inviterName', type: 'string', size: 100, required: true },
      { key: 'inviteeEmail', type: 'string', size: 100, required: true },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'message', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'inviteCode', type: 'string', size: 50, required: true },
      { key: 'expiresAt', type: 'datetime', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'acceptedAt', type: 'datetime', required: false },
      { key: 'acceptedBy', type: 'string', size: 50, required: false },
      { key: 'declinedAt', type: 'datetime', required: false }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          TEAM_INVITES_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          TEAM_INVITES_COLLECTION_ID,
          attr.key,
          attr.required
        );
      }
      
      // Wait a bit between attribute creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Team invites collection created successfully');
    return collection;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('ℹ️ Team invites collection already exists');
      return null;
    }
    console.error('❌ Error creating team invites collection:', error);
    throw error;
  }
}

// Create channel_invites collection
async function createChannelInvitesCollection() {
  try {
    console.log('🔧 Creating channel_invites collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      CHANNEL_INVITES_COLLECTION_ID,
      'Channel Invites',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    const attributes = [
      { key: 'channelId', type: 'string', size: 50, required: true },
      { key: 'channelName', type: 'string', size: 100, required: true },
      { key: 'teamId', type: 'string', size: 50, required: true },
      { key: 'inviterUserId', type: 'string', size: 50, required: true },
      { key: 'inviterName', type: 'string', size: 100, required: true },
      { key: 'inviteeEmail', type: 'string', size: 100, required: true },
      { key: 'message', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'inviteCode', type: 'string', size: 50, required: true },
      { key: 'expiresAt', type: 'datetime', required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'acceptedAt', type: 'datetime', required: false },
      { key: 'declinedAt', type: 'datetime', required: false }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          CHANNEL_INVITES_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          CHANNEL_INVITES_COLLECTION_ID,
          attr.key,
          attr.required
        );
      }
      
      // Wait a bit between attribute creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Channel invites collection created successfully');
    return collection;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('ℹ️ Channel invites collection already exists');
      return null;
    }
    console.error('❌ Error creating channel invites collection:', error);
    throw error;
  }
}

// Create team_members collection
async function createTeamMembersCollection() {
  try {
    console.log('🔧 Creating team_members collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      TEAM_MEMBERS_COLLECTION_ID,
      'Team Members',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    const attributes = [
      { key: 'teamId', type: 'string', size: 50, required: true },
      { key: 'userId', type: 'string', size: 50, required: false },
      { key: 'userEmail', type: 'string', size: 100, required: true },
      { key: 'userName', type: 'string', size: 100, required: true },
      { key: 'userAvatar', type: 'string', size: 255, required: false },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'invitedBy', type: 'string', size: 50, required: true },
      { key: 'invitedAt', type: 'datetime', required: true },
      { key: 'joinedAt', type: 'datetime', required: false }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          TEAM_MEMBERS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          TEAM_MEMBERS_COLLECTION_ID,
          attr.key,
          attr.required
        );
      }
      
      // Wait a bit between attribute creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Team members collection created successfully');
    return collection;
  } catch (error: any) {
    if (error.code === 409) {
      console.log('ℹ️ Team members collection already exists');
      return null;
    }
    console.error('❌ Error creating team members collection:', error);
    throw error;
  }
}

// Main setup function
export async function setupInviteCollections() {
  try {
    console.log('🚀 Setting up invite collections...');
    
    // Create collections in order
    await createTeamMembersCollection();
    await createTeamInvitesCollection();
    await createChannelInvitesCollection();
    
    console.log('✅ All invite collections setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up invite collections:', error);
    return false;
  }
}

// Check if collections exist
export async function checkCollectionsExist() {
  try {
    const collections = [
      TEAM_INVITES_COLLECTION_ID,
      CHANNEL_INVITES_COLLECTION_ID,
      TEAM_MEMBERS_COLLECTION_ID
    ];
    
    const results = await Promise.allSettled(
      collections.map(id => databases.getCollection(DATABASE_ID, id))
    );
    
    const existing = results.map((result, index) => ({
      collection: collections[index],
      exists: result.status === 'fulfilled'
    }));
    
    console.log('📊 Collection status:', existing);
    return existing;
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    return [];
  }
}