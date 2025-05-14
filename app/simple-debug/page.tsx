'use client';

import { useState, useEffect } from 'react';
import appwriteSimple from '@/lib/appwrite-simple';
import Link from 'next/link';

export default function SimpleDebugPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const testConnection = async () => {
    setStatus('testing');
    setError(null);
    
    try {
      // Get client
      const client = appwriteSimple.getClient();
      
      // Try a simple health check
      const healthResponse = await fetch('https://fra.cloud.appwrite.io/v1/health/time', {
        headers: {
          'X-Appwrite-Project': '68235ffb0033b3172656'
        }
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed with status ${healthResponse.status}`);
      }
      
      const timeData = await healthResponse.json();
      
      // Try to get client info (for debugging purposes)
      const clientInfo = {
        endpoint: (client as any).endpoint || '',
        projectId: (client as any).config?.project || '',
        headers: (client as any).headers || {}
      };
      
      setResponse({
        clientInfo,
        serverTime: new Date(timeData.current).toISOString(),
        rawResponse: timeData
      });
      
      setStatus('success');
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };
  
  // Auto-test on page load
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Appwrite Client Debug</h1>
        
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={testConnection} 
              disabled={status === 'testing'}
              className={`px-4 py-2 rounded-md transition ${
                status === 'testing' ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            
            <div className="text-lg">
              Status: {' '}
              {status === 'idle' && <span className="text-gray-400">Ready</span>}
              {status === 'testing' && (
                <span className="text-yellow-400 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </span>
              )}
              {status === 'success' && <span className="text-green-400">Connected ✓</span>}
              {status === 'error' && <span className="text-red-400">Error ✗</span>}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-md">
            <h3 className="font-semibold text-red-300 mb-2">Error:</h3>
            <p className="text-red-200">{error}</p>
            
            <div className="mt-4 p-3 bg-red-900/60 rounded-md">
              <h4 className="font-medium text-red-300 mb-2">Possible solutions:</h4>
              <ul className="list-disc list-inside text-red-200 space-y-1">
                <li>Run the fix script: <code className="px-1 py-0.5 bg-red-900 rounded">node fix-appwrite.js</code></li>
                <li>Check that your Appwrite instance at fra.cloud.appwrite.io is running</li>
                <li>Verify your Project ID is correct</li>
                <li>Check for network connectivity issues</li>
              </ul>
            </div>
          </div>
        )}
        
        {status === 'success' && response && (
          <div className="mb-6 p-4 bg-green-900/40 border border-green-700 rounded-md">
            <h3 className="font-semibold text-green-300 mb-3">Connection Successful!</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-300 mb-1">Server Time:</h4>
                <p className="text-green-200">{response.serverTime}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-green-300 mb-1">Client Information:</h4>
                <pre className="p-3 bg-gray-800 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(response.clientInfo, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4 p-3 bg-green-900/60 rounded-md">
                <p className="text-green-200">
                  The simplified Appwrite client is working correctly! If your main application is
                  still having issues, run the fix script to replace the broken file:
                </p>
                <pre className="mt-2 p-2 bg-gray-800 rounded-md text-sm">
                  node fix-appwrite.js
                </pre>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-800 rounded-md">
          <h3 className="font-semibold text-blue-300 mb-3">How to Fix Your Appwrite Connection</h3>
          
          <ol className="list-decimal list-inside text-blue-200 space-y-3 ml-2">
            <li>
              <span className="font-medium">Run the fix script</span> to replace your broken appwrite.ts file:
              <pre className="mt-1 mb-2 p-2 bg-gray-800 rounded-md text-sm">
                node fix-appwrite.js
              </pre>
              This will replace your current file with a simplified version that works correctly.
            </li>
            
            <li>
              <span className="font-medium">Restart your development server</span> after making the change.
            </li>
            
            <li>
              <span className="font-medium">If needed, copy additional functionality</span> from your backup file (appwrite.ts.backup) 
              to the new file once the app is working.
            </li>
          </ol>
          
          <div className="mt-6 flex space-x-4">
            <Link 
              href="/simple-debug"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-md"
            >
              Refresh This Page
            </Link>
            
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Go To Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}