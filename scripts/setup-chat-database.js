// Appwrite Database Setup Script for Team Chat
// Run this in your browser console on the Appwrite console page

// 1. First, make sure you're logged into your Appwrite Console
// 2. Navigate to your project's Database section
// 3. Open browser console and run this script

const setupTeamChatDatabase = async () => {
  console.log('🚀 Setting up Team Chat Database...');
    // Collection Configuration
  const collectionsToCreate = [
    {
      name: 'chat_messages',
      id: 'chat_messages',
      attributes: [
        { key: 'teamId', type: 'string', size: 255, required: true },
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'content', type: 'string', size: 2000, required: true },
        { key: 'userName', type: 'string', size: 255, required: false },
        { key: 'type', type: 'string', size: 50, required: false, default: 'text' },
        { key: 'isEdited', type: 'boolean', required: false, default: false },
        { key: 'createdAt', type: 'string', size: 255, required: true }
      ],
      indexes: [
        { key: 'teamId_index', type: 'key', attributes: ['teamId'] },
        { key: 'createdAt_index', type: 'key', attributes: ['createdAt'], orders: ['DESC'] }
      ]
    }
  ];
  
  console.log('📋 Collections to create:', collectionsToCreate);
  
  // Manual Setup Instructions
  console.log(`  🔧 MANUAL SETUP REQUIRED:
  
  1. CREATE COLLECTION:
     - Name: chat_messages
     - Collection ID: chat_messages
  
  2. ADD ATTRIBUTES:
     - teamId: String (255 chars, required)
     - userId: String (255 chars, required) 
     - content: String (2000 chars, required)
     - userName: String (255 chars, optional)
     - type: String (50 chars, optional, default: 'text')
     - isEdited: Boolean (optional, default: false)
     - createdAt: String (255 chars, required)
  
  3. SET PERMISSIONS:
     - Read: users (any authenticated user)
     - Create: users (any authenticated user)
     - Update: users (any authenticated user)
     - Delete: users (any authenticated user)
  
  4. CREATE INDEXES (optional but recommended):
     - teamId_index: key index on teamId
     - createdAt_index: key index on createdAt (DESC order)
  
  5. UPDATE TEAMS COLLECTION:
     Make sure your teams collection has these attributes:
     - owner: String (255 chars, required) - for team ownership
     - ownerId: String (255 chars, optional) - alternative ownership field
     - members: String[] (array, optional) - for team members list
  `);
  
  return {
    status: 'ready',
    message: 'Follow the manual setup instructions above'
  };
};

// Call the setup function
setupTeamChatDatabase().then(result => {
  console.log('✅ Setup completed:', result);
});

export default setupTeamChatDatabase;