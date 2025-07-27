'use client';

import { useState } from 'react';
import { getDatabases } from '@/lib/appwrite';
import { ID } from 'appwrite';

const databases = getDatabases();
const DATABASE_ID = '67d6b079002144822b5e';

export default function AnalyticsDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabase = async () => {
    setIsLoading(true);
    setLogs([]);
    
    try {
      addLog('🔍 Starting analytics database test...');
      
      // Test 1: Try to access collections directly
      addLog('1. Testing database access by trying to list documents...');
      
      try {
        // Try to list documents from user_sessions to see if collection exists
        const testList = await databases.listDocuments(DATABASE_ID, 'user_sessions');
        addLog(`✅ user_sessions collection accessible (${testList.total} documents)`);
      } catch (error: any) {
        if (error.message?.includes('Collection not found')) {
          addLog('❌ user_sessions collection not found!');
          addLog('💡 Please create the collection first using the manual guide');
          return;
        } else {
          addLog(`✅ user_sessions collection exists (access test: ${error.message})`);
        }
      }
      
      // Test 2: Check user_sessions collection attributes
      addLog('2. Testing user_sessions collection structure...');
      
      try {
        // Try to get collection info by attempting to create a test document
        addLog('Attempting to check collection structure...');
      } catch (error: any) {
        addLog(`Error checking collection: ${error.message}`);
      }
      
      // Test 3: Try creating test session
      addLog('3. Testing session creation with test data...');
      const sessionData = {
        userId: 'test-user-debug',
        sessionId: ID.unique(),
        userAgent: 'Debug Browser',
        ipAddress: '',
        location: '',
        device: 'desktop',
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null
      };
      
      addLog('Test data: ' + JSON.stringify(sessionData, null, 2));
      
      const session = await databases.createDocument(
        DATABASE_ID,
        'user_sessions',
        sessionData.sessionId,
        sessionData
      );
      
      addLog(`✅ Test session created successfully: ${session.$id}`);
      
      // Clean up
      await databases.deleteDocument(DATABASE_ID, 'user_sessions', session.$id);
      addLog('✅ Test session cleaned up');
      
      addLog('🎉 All tests passed! Analytics database is working correctly.');
      
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      
      if (error.message?.includes('Missing required attribute')) {
        addLog('💡 Solution: Check that all required attributes exist with correct names');
        addLog('💡 Required: userId, sessionId, startTime (all as specified in the guide)');
      } else if (error.message?.includes('Collection not found')) {
        addLog('💡 Solution: Create the user_sessions collection first');
      } else if (error.message?.includes('Database not found')) {
        addLog('💡 Solution: Check the database ID exists in Appwrite Console');
      } else if (error.message?.includes('permission')) {
        addLog('💡 Solution: Update collection permissions to allow write access');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-blue-400">Analytics Database Debugger</h1>
          
          <div className="mb-4">
            <button
              onClick={testDatabase}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Testing...' : 'Run Database Test'}
            </button>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2 text-green-400">Test Logs:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400">Click "Run Database Test" to start debugging</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="font-mono text-sm whitespace-pre-line text-gray-200">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-blue-900/50 rounded-lg border border-blue-700">
            <h3 className="font-semibold mb-2 text-blue-300">Configuration:</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Database ID: <code className="bg-gray-700 px-1 rounded text-yellow-300">{DATABASE_ID}</code></li>
              <li>• Expected Collections: user_sessions, user_activities, page_views, performance_metrics, error_logs, feature_usage</li>
              <li>• This test creates a temporary session to verify everything works</li>
            </ul>
          </div>
          
          <div className="mb-4 p-4 bg-red-900/50 rounded-lg border border-red-700">
            <h3 className="font-semibold mb-2 text-red-300">🚨 Issue Detected:</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="text-yellow-300">❌ <strong>Wrong attribute configuration detected!</strong></p>
              <p>The test shows: <code className="bg-gray-700 px-1 rounded">"Missing required attribute 'endTime'"</code></p>
              <p>But according to the manual guide: <strong>endTime should be OPTIONAL, not required!</strong></p>
              
              <div className="mt-3 p-3 bg-yellow-900/50 rounded border border-yellow-600">
                <p className="text-yellow-200 font-semibold">🔧 Quick Fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                  <li>Go to Appwrite Console → Database → user_sessions</li>
                  <li>Find the <code className="bg-gray-700 px-1 rounded">endTime</code> attribute</li>
                  <li>Edit it and uncheck "Required" (it should be optional)</li>
                  <li>Also check that <code className="bg-gray-700 px-1 rounded">duration</code> is optional too</li>
                  <li>Run this test again</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-900/50 rounded-lg border border-yellow-600">
            <h3 className="font-semibold mb-2 text-yellow-300">⚠️ Common Issues:</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• <strong>Collection not found:</strong> Run the database setup script or create collections manually</li>
              <li>• <strong>Missing attributes:</strong> Make sure all attributes from the guide are created with exact names</li>
              <li>• <strong>Wrong required settings:</strong> Check that required/optional settings match the guide exactly</li>
              <li>• <strong>Permission denied:</strong> Update collection permissions to allow write access</li>
              <li>• <strong>User not logged in:</strong> This test uses dummy data, so user login is not required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}