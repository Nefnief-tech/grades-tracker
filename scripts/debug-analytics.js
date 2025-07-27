// Debug script to test analytics database connection
import { getDatabases } from './lib/appwrite';
import { ID } from 'appwrite';

const databases = getDatabases();
const DATABASE_ID = '67d6b079002144822b5e';

async function testAnalyticsDatabase() {
  console.log('🔍 Testing Analytics Database...');
  
  try {
    // Test 1: Check if database exists
    console.log('1. Testing database access...');
    const collections = await databases.listCollections(DATABASE_ID);
    console.log('✅ Database accessible. Collections found:', collections.documents.length);
    
    // Test 2: Check user_sessions collection
    console.log('2. Testing user_sessions collection...');
    const userSessionsCollection = collections.documents.find(c => c.$id === 'user_sessions');
    if (userSessionsCollection) {
      console.log('✅ user_sessions collection found');
      console.log('Attributes:', userSessionsCollection.attributes?.map(a => a.key).join(', '));
    } else {
      console.error('❌ user_sessions collection not found');
      return;
    }
    
    // Test 3: Try to create a test session
    console.log('3. Testing session creation...');
    const testSessionData = {
      userId: 'test-user-123',
      sessionId: ID.unique(),
      userAgent: 'Test Browser',
      ipAddress: '',
      location: '',
      device: 'desktop',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null
    };
    
    console.log('Test data:', testSessionData);
    
    const testSession = await databases.createDocument(
      DATABASE_ID,
      'user_sessions',
      testSessionData.sessionId,
      testSessionData
    );
    
    console.log('✅ Test session created successfully:', testSession.$id);
    
    // Clean up test session
    await databases.deleteDocument(DATABASE_ID, 'user_sessions', testSession.$id);
    console.log('✅ Test session cleaned up');
    
    console.log('🎉 All tests passed! Analytics database is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Detailed error analysis
    if (error.message?.includes('Missing required attribute')) {
      console.log('💡 This suggests the collection exists but attributes are missing or incorrectly configured');
    } else if (error.message?.includes('Collection not found')) {
      console.log('💡 The user_sessions collection doesn\'t exist or has wrong ID');
    } else if (error.message?.includes('Database not found')) {
      console.log('💡 The database doesn\'t exist or has wrong ID');
    }
  }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.testAnalyticsDatabase = testAnalyticsDatabase;
  console.log('💡 Run testAnalyticsDatabase() in console to debug');
} else {
  // Node.js environment
  testAnalyticsDatabase();
}

export { testAnalyticsDatabase };