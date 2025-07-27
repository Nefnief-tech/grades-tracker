import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

const databases = getDatabases();
const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';
const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';

// Create a chat channel
export async function createChatChannel(data: {
  teamId: string;
  name: string;
  description?: string;
  type?: string;
  isPrivate?: boolean;
  createdBy: string;
}) {
  try {
    const channel = await databases.createDocument(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      ID.unique(),
      {
        teamId: data.teamId,
        name: data.name,
        description: data.description || '',
        type: data.type || 'text',
        isPrivate: data.isPrivate || false,
        createdBy: data.createdBy,
        messageCount: 0,
        createdAt: new Date().toISOString()
      }
    );
    
    console.log('✅ Chat channel created:', channel);
    return channel;
  } catch (error) {
    console.error('❌ Error creating chat channel:', error);
    throw error;
  }
}

// Get channels for a team
export async function getTeamChannels(teamId: string) {
  try {
    console.log('🔍 Getting channels for team:', teamId);
    
    const channels = await databases.listDocuments(
      DATABASE_ID,
      CHAT_CHANNELS_COLLECTION_ID,
      [
        Query.equal('teamId', [teamId]),
        Query.orderAsc('createdAt')
      ]
    );
    
    console.log('✅ Found channels:', channels.documents.length);
    return channels.documents;
  } catch (error) {
    console.error('❌ Error getting team channels:', error);
    throw error;
  }
}

// Send a message to a channel
export async function sendChatMessage(data: {
  channelId: string;
  teamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
}) {
  try {
    console.log('📤 Sending message to channel:', data.channelId);
    
    const message = await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        channelId: data.channelId,
        teamId: data.teamId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar || '',
        content: data.content,
        type: 'text',
        isEdited: false,
        createdAt: new Date().toISOString()
      }
    );
    
    // Update channel message count
    try {
      const channel = await databases.getDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        data.channelId
      );
      
      await databases.updateDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        data.channelId,
        {
          messageCount: (channel.messageCount || 0) + 1,
          lastMessageAt: new Date().toISOString(),
          lastMessageId: message.$id
        }
      );
    } catch (updateError) {
      console.log('⚠️ Could not update channel message count:', updateError);
    }
    
    console.log('✅ Message sent:', message);
    return message;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
}

// Get messages for a channel
export async function getChannelMessages(channelId: string, limit: number = 50) {
  try {
    console.log('🔍 Getting messages for channel:', channelId);
    
    const messages = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES_COLLECTION_ID,
      [
        Query.equal('channelId', [channelId]),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );
    
    console.log('✅ Found messages:', messages.documents.length);
    // Return in chronological order (oldest first)
    return messages.documents.reverse();
  } catch (error) {
    console.error('❌ Error getting channel messages:', error);
    throw error;
  }
}

// Create default general channel for a team
export async function createDefaultChannel(teamId: string, createdBy: string) {
  try {
    return await createChatChannel({
      teamId,
      name: 'general',
      description: 'General team discussion',
      type: 'text',
      isPrivate: false,
      createdBy
    });
  } catch (error) {
    console.error('❌ Error creating default channel:', error);
    throw error;
  }
}