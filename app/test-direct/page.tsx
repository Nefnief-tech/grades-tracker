'use client';

import { useState, useEffect } from 'react';
import { getDirectClient, testConnection } from '@/lib/appwrite-direct';
import { Client } from 'appwrite';

export default function DirectTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    testDirectClient();
  }, []);
  
  const testDirectClient = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      // Get direct client
      const client = getDirectClient();
      
      // Test connection
      const connected = await testConnection();
      
      if (!connected) {
        throw new Error('Connection test failed');
      }
      
      // Get client info
      const clientInfo = {
        // Try to safely extract some client info
        headers: (client as any).headers || {},
        endpoint: (client as any).endpoint || '',
      };
      
      // Send health time request directly
      const response = await fetch('https://fra.cloud.appwrite.io/v1/health/time', {
        headers: {
          'X-Appwrite-Project': '68235ffb0033b3172656',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      
      const healthResult = await response.json();
      
      setResult({
        client: clientInfo,
        health: healthResult,
        timestamp: new Date().toISOString()
      });
      
      setStatus('success');
    } catch (err) {
      console.error('Direct client test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Direct Appwrite API Test</h1>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            This page tests a direct connection to Appwrite using hardcoded endpoint and project ID values.
          </p>
          
          <button 
            onClick={testDirectClient}
            disabled={status === 'loading'}
            className={`px-6 py-2 rounded-md ${
              status === 'loading' ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-200 mb-8`}
          >
            {status === 'loading' ? 'Testing...' : 'Test Direct Connection'}
          </button>
        </div>
        
        {status === 'loading' && (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-400">Testing connection...</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-900/30 p-6 rounded-lg border border-red-800/50 mb-6">
            <h2 className="text-xl font-semibold mb-2 text-red-400">Connection Failed</h2>
            <p className="text-red-300">{error}</p>
            
            <div className="mt-4 p-4 bg-red-950/50 rounded border border-red-900/50">
              <p className="font-medium text-red-300">Possible causes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-red-200">
                <li>Network connectivity issue</li>
                <li>Endpoint URL is incorrect</li>
                <li>Project ID is invalid</li>
                <li>Firewall or CORS restrictions</li>
              </ul>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-900/30 p-6 rounded-lg border border-green-800/50 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Connection Successful!</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-green-300 mb-2">Client Information:</h3>
                <pre className="p-4 bg-gray-800 rounded-md overflow-x-auto text-gray-300 border border-gray-700">
                  {JSON.stringify(result.client, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-green-300 mb-2">Health Check:</h3>
                <pre className="p-4 bg-gray-800 rounded-md overflow-x-auto text-gray-300 border border-gray-700">
                  {JSON.stringify(result.health, null, 2)}
                </pre>
              </div>
            </div>
            
            <p className="mt-6 text-green-300">
              ✅ Your application can connect to Appwrite using the hardcoded endpoint and project ID.
            </p>
          </div>
        )}
        
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Using Direct API in Your App</h2>
          <p className="text-blue-100 mb-4">
            To use this approach in your application, import the functions from <code className="bg-blue-950 px-2 py-1 rounded">@/lib/appwrite-direct</code>:
          </p>
          
          <pre className="p-4 bg-gray-800 rounded-md overflow-x-auto text-blue-300 border border-gray-700 mb-4">
{`import { getDirectClient, getDatabases } from '@/lib/appwrite-direct';

// Get a client with hardcoded values
const client = getDirectClient();

// Get databases service
const databases = getDatabases();

// Make API calls...
const response = await databases.listDocuments(...);`}
          </pre>
          
          <p className="text-blue-100">
            This bypasses environment variables and guarantees your application connects to the correct Appwrite instance.
          </p>
        </div>
      </div>
    </div>
  );
}