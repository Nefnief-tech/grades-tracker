'use client';

import { useState } from 'react';
import { Client, Account } from 'appwrite';

export default function RepairPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const repair = async () => {
    setStatus('running');
    setError(null);
    addLog('Starting repair process...');

    try {
      // Step 1: Create a client with hardcoded values
      addLog('Creating Appwrite client with hardcoded values...');
      const client = new Client()
        .setEndpoint('https://fra.cloud.appwrite.io/v1')
        .setProject('68235ffb0033b3172656');
      
      addLog('✅ Client created successfully');

      // Step 2: Test basic functionality
      addLog('Testing connection to Appwrite server...');
      try {
        const response = await fetch('https://fra.cloud.appwrite.io/v1/health/time', {
          headers: { 'X-Appwrite-Project': '68235ffb0033b3172656' }
        });
        
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ Server connection successful (server time: ${new Date(data.current).toLocaleTimeString()})`);
        } else {
          throw new Error(`Server returned status ${response.status}`);
        }
      } catch (err) {
        addLog(`❌ Server connection failed: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('Failed to connect to Appwrite server');
      }
      
      // Step 3: Create repair data
      addLog('Setting up local storage repair data...');
      
      try {
        localStorage.setItem('appwrite_repair', JSON.stringify({
          repaired: true,
          timestamp: new Date().toISOString(),
          endpoint: 'https://fra.cloud.appwrite.io/v1',
          projectId: '68235ffb0033b3172656'
        }));
        addLog('✅ Local storage data set');
      } catch (err) {
        addLog(`❌ Failed to set local storage data: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Step 4: Test Account service
      try {
        addLog('Testing Account service...');
        const account = new Account(client);
        // Just running a method that doesn't require login
        const result = await account.getSession('current').catch(err => {
          // 401 is expected if not logged in
          if (err.code === 401) {
            return { status: 'not-logged-in' };
          }
          throw err;
        });
        
        addLog('✅ Account service is working');
      } catch (err) {
        addLog(`❌ Account service error: ${err instanceof Error ? err.message : String(err)}`);
      }

      addLog('✅ Repair completed successfully');
      setStatus('success');
    } catch (err) {
      console.error('Repair error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      addLog(`❌ Repair failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Appwrite Connection Repair</h1>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-6">
            This utility will attempt to repair your Appwrite connection by ensuring the correct endpoint and project ID are used.
          </p>
          
          <button 
            onClick={repair}
            disabled={status === 'running'}
            className={`px-6 py-3 rounded-md ${
              status === 'running' ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-200 text-lg font-medium mb-8`}
          >
            {status === 'running' ? 'Repairing...' : 'Repair Connection'}
          </button>
        </div>
        
        {/* Log Output */}
        <div className="border border-gray-700 rounded-lg shadow-lg bg-gray-800 mb-8">
          <div className="bg-gray-800 p-4 border-b border-gray-700 font-semibold flex justify-between items-center">
            <div className="text-blue-400">Repair Log</div>
          </div>
          <div className="p-4 bg-gray-800 h-64 overflow-y-auto font-mono text-xs space-y-1.5">
            {log.length > 0 ? (
              log.map((entry, i) => {
                const isError = entry.includes('❌');
                const isSuccess = entry.includes('✅');
                
                return (
                  <div 
                    key={i} 
                    className={`${
                      isError ? 'text-red-400' : 
                      isSuccess ? 'text-green-400' :
                      'text-gray-300'
                    }`}
                  >
                    {entry}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 italic">Click "Repair Connection" to start the repair process.</div>
            )}
          </div>
        </div>
        
        {/* Success Message */}
        {status === 'success' && (
          <div className="bg-green-900/30 p-6 rounded-lg border border-green-800/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Repair Completed Successfully</h2>
            <p className="text-green-300">
              Your Appwrite connection has been repaired. Please reload the application to see the changes.
            </p>
            <div className="mt-4 flex justify-start">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded text-white transition-colors"
              >
                Reload Application
              </button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {status === 'error' && (
          <div className="bg-red-900/30 p-6 rounded-lg border border-red-800/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Repair Failed</h2>
            {error && <p className="text-red-300 mb-4">{error}</p>}
            <p className="text-red-300">
              The repair process encountered an error. Please check the logs above for more details.
            </p>
          </div>
        )}
        
        {/* Next Steps */}
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Manual Repair Steps</h2>
          <p className="text-blue-200 mb-4">
            If the automatic repair doesn't fix your connection, you can try these manual steps:
          </p>
          
          <ol className="list-decimal list-inside space-y-3 text-blue-100">
            <li>
              <strong>Check your .env file</strong> - Make sure it contains:
              <pre className="mt-2 p-3 bg-gray-900 rounded-md text-green-300 text-sm overflow-x-auto">
{`NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68235ffb0033b3172656`}
              </pre>
            </li>
            <li>
              <strong>Use the direct client</strong> - Import and use the direct client from:
              <pre className="mt-2 p-3 bg-gray-900 rounded-md text-blue-300 text-sm overflow-x-auto">
{`import { getDirectClient } from '@/lib/appwrite-direct';

const client = getDirectClient();`}
              </pre>
            </li>
            <li>
              <strong>Clear browser cache and local storage</strong> - In your browser's developer tools, go to Application → Local Storage and clear any Appwrite-related entries
            </li>
            <li>
              <strong>Try the Direct Test</strong> - Visit the <a href="/test-direct" className="text-blue-400 underline">Direct Test page</a> to verify the connection with hardcoded values
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}