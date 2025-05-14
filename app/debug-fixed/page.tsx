'use client';

import { useState, useEffect } from 'react';
import * as appwrite from '@/lib/appwrite-fixed';

export default function DebugFixedPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      console.log('Testing connection with fixed Appwrite client...');
      
      // Get the client and initialize it
      const client = appwrite.getClient();
      
      // Try to access the client's properties
      const clientDetails = {
        endpoint: (client as any).endpoint || 'Unknown',
        headers: (client as any).headers || {},
      };
      
      setClientInfo(clientDetails);
      
      // Test the connection
      const connected = await appwrite.checkCloudConnection();
      
      if (connected) {
        setStatus('success');
      } else {
        setError('Connection check failed - server did not respond successfully');
        setStatus('error');
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Fixed Appwrite Client Test</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          Connection Status:
          {status === 'checking' && (
            <span className="ml-3 flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Checking...
            </span>
          )}
          {status === 'success' && (
            <span className="ml-3 text-green-400">Connected ✓</span>
          )}
          {status === 'error' && (
            <span className="ml-3 text-red-400">Failed ✗</span>
          )}
        </h2>
        
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-800 p-4 rounded-md">
            <h3 className="text-red-400 font-medium mb-2">Error Details</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mt-4 bg-green-900/30 border border-green-800 p-4 rounded-md">
            <h3 className="text-green-400 font-medium mb-2">Connection Successful!</h3>
            <p className="text-green-300">Your Appwrite connection is working properly.</p>
          </div>
        )}
        
        <button
          onClick={testConnection}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Test Connection Again
        </button>
      </div>
      
      {clientInfo && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Client Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Endpoint:</h3>
              <p className="font-mono bg-gray-900 p-3 rounded">{clientInfo.endpoint}</p>
            </div>
            
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Headers:</h3>
              <pre className="font-mono bg-gray-900 p-3 rounded overflow-auto max-h-48">
                {JSON.stringify(clientInfo.headers, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4">
              <h3 className="text-blue-400 font-medium mb-2">Environment Variables:</h3>
              <div className="font-mono bg-gray-900 p-3 rounded">
                <p><span className="text-pink-400">NEXT_PUBLIC_APPWRITE_ENDPOINT:</span> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set'}</p>
                <p><span className="text-pink-400">NEXT_PUBLIC_APPWRITE_PROJECT_ID:</span> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set'}</p>
                <p><span className="text-pink-400">NEXT_PUBLIC_APPWRITE_DATABASE_ID:</span> {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800">
        <h2 className="text-xl font-semibold mb-4">Appwrite Client Fix</h2>
        
        <p className="mb-4">
          This page is using the fixed Appwrite client from <code className="bg-gray-800 px-2 py-1 rounded">appwrite-fixed.ts</code>.
          If the connection works here but not in your main app, follow these steps:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Run the transition script: <code className="bg-gray-800 px-2 py-1 rounded">node scripts/transition-appwrite.js</code></li>
          <li>Restart your development server</li>
          <li>Test your application again</li>
        </ol>
        
        <p className="mt-4">
          The fixed client uses hardcoded values for endpoint and project ID, bypassing any environment variable issues.
        </p>
      </div>
    </div>
  );
}