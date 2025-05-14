'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from 'appwrite';

export default function AppwriteDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Log environment variables
  useEffect(() => {
    const envVars = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID'
    ];

    addLog('🔍 Environment Variables:');
    envVars.forEach(varName => {
      const value = process.env[varName];
      addLog(`${varName}: ${value ? '✅ Set' : '❌ Missing'} ${value ? `(${value})` : ''}`);
    });
    
    // Run initial tests
    runTests();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runTests = async () => {
    try {
      setIsLoading(true);
      setTestResults([]);
      
      addLog('🔄 Starting Appwrite connection tests...');
      
      // Test 1: Create client with hardcoded values first
      const hardcodedTest = await testClient({
        endpoint: 'https://fra.cloud.appwrite.io/v1',
        projectId: '68235ffb0033b3172656',
        testName: 'Hardcoded values'
      });
      
      // Test 2: Create client with environment variables
      const envTest = await testClient({
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
        testName: 'Environment variables'
      });
      
      // Test 3: Simple fetch request to health endpoint
      const fetchTest = await testFetch({
        endpoint: 'https://fra.cloud.appwrite.io/v1',
        projectId: '68235ffb0033b3172656',
        testName: 'Direct fetch'
      });

      // Test 4: Try a different project ID
      const alternateIdTest = await testClient({
        endpoint: 'https://fra.cloud.appwrite.io/v1',
        projectId: '67d6ea990025fa097964', // Old ID
        testName: 'Alternative Project ID'
      });
      
      addLog('✅ All tests completed!');
    } catch (error) {
      addLog(`❌ Error running tests: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testClient = async ({ endpoint, projectId, testName }: { endpoint: string, projectId: string, testName: string }) => {
    try {
      addLog(`🔄 Testing "${testName}" - Endpoint: ${endpoint}, Project ID: ${projectId}`);
      
      if (!endpoint || !projectId) {
        const result = {
          testName,
          endpoint,
          projectId,
          success: false,
          error: 'Missing endpoint or project ID',
          duration: 0
        };
        setTestResults(prev => [...prev, result]);
        addLog(`❌ Test "${testName}" failed: Missing endpoint or project ID`);
        return result;
      }
      
      const startTime = performance.now();
      
      // Create client
      const client = new Client();
      
      // Set endpoint
      try {
        client.setEndpoint(endpoint);
        addLog(`✅ "${testName}": Endpoint set successfully`);
      } catch (error) {
        const result = {
          testName,
          endpoint,
          projectId,
          success: false,
          error: `Failed to set endpoint: ${error instanceof Error ? error.message : String(error)}`,
          duration: performance.now() - startTime
        };
        setTestResults(prev => [...prev, result]);
        addLog(`❌ Test "${testName}" failed: Could not set endpoint`);
        return result;
      }
      
      // Set project ID
      try {
        client.setProject(projectId);
        addLog(`✅ "${testName}": Project ID set successfully`);
      } catch (error) {
        const result = {
          testName,
          endpoint,
          projectId,
          success: false,
          error: `Failed to set project ID: ${error instanceof Error ? error.message : String(error)}`,
          duration: performance.now() - startTime
        };
        setTestResults(prev => [...prev, result]);
        addLog(`❌ Test "${testName}" failed: Could not set project ID`);
        return result;
      }
      
      // Try to access client headers
      let headers = null;
      try {
        // Access internal client headers (might be private/protected)
        headers = (client as any).headers;
        addLog(`✅ "${testName}": Retrieved client headers`);
        
        // Important: Check if Project ID is included in headers
        if (headers && (!headers['X-Appwrite-Project'] || headers['X-Appwrite-Project'] !== projectId)) {
          addLog(`⚠️ "${testName}": Project ID is not properly set in headers`);
        }
        
      } catch (error) {
        addLog(`⚠️ "${testName}": Could not access client headers`);
      }
      
      // Try health endpoint
      try {
        const healthStart = performance.now();
        const response = await fetch(`${endpoint}/health/time`, {
          headers: {
            'X-Appwrite-Project': projectId
          }
        });
        
        const responseTime = performance.now() - healthStart;
        
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ "${testName}": Health endpoint responded in ${responseTime.toFixed(0)}ms`);
        } else {
          const errorData = await response.text();
          throw new Error(`Status: ${response.status}, ${errorData}`);
        }
      } catch (error) {
        addLog(`❌ "${testName}": Health endpoint check failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      const duration = performance.now() - startTime;
      
      const result = {
        testName,
        endpoint,
        projectId,
        headers,
        success: true,
        duration
      };
      
      setTestResults(prev => [...prev, result]);
      addLog(`✅ Test "${testName}" passed in ${duration.toFixed(0)}ms`);
      
      return result;
    } catch (error) {
      const result = {
        testName,
        endpoint,
        projectId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0
      };
      
      setTestResults(prev => [...prev, result]);
      addLog(`❌ Test "${testName}" failed with error: ${error instanceof Error ? error.message : String(error)}`);
      
      return result;
    }
  };

  const testFetch = async ({ endpoint, projectId, testName }: { endpoint: string, projectId: string, testName: string }) => {
    try {
      addLog(`🔄 Testing "${testName}" - Direct fetch to ${endpoint}/health/time`);
      
      const startTime = performance.now();
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId
      };
      
      addLog(`📤 "${testName}": Sending request with headers: ${JSON.stringify(headers)}`);
      
      const response = await fetch(`${endpoint}/health/time`, {
        method: 'GET',
        headers
      });
      
      const duration = performance.now() - startTime;
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        
        const result = {
          testName,
          endpoint,
          projectId,
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${errorText}`,
          duration
        };
        
        setTestResults(prev => [...prev, result]);
        addLog(`❌ "${testName}" failed: HTTP ${response.status}`);
        
        return result;
      }
      
      const data = await response.json();
      
      const result = {
        testName,
        endpoint,
        projectId,
        success: true,
        data,
        duration
      };
      
      setTestResults(prev => [...prev, result]);
      addLog(`✅ "${testName}" succeeded in ${duration.toFixed(0)}ms: ${JSON.stringify(data)}`);
      
      return result;
    } catch (error) {
      const result = {
        testName,
        endpoint,
        projectId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: 0
      };
      
      setTestResults(prev => [...prev, result]);
      addLog(`❌ "${testName}" failed with error: ${error instanceof Error ? error.message : String(error)}`);
      
      return result;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Appwrite Connection Diagnostics</h1>
        
        <div className="mb-6 flex gap-4">
          <button 
            onClick={runTests}
            disabled={isLoading}
            className={`px-6 py-2 rounded-md ${
              isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-200`}
          >
            {isLoading ? 'Testing...' : 'Run Tests'}
          </button>
          
          <button 
            onClick={clearLogs}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors duration-200"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Log Console */}
          <div className="border border-gray-700 rounded-lg shadow-lg bg-gray-800">
            <div className="bg-gray-800 p-4 border-b border-gray-700 font-semibold flex justify-between items-center">
              <div className="text-blue-400">Connection Logs</div>
              <div className="text-xs text-gray-400">{logs.length} entries</div>
            </div>
            <div 
              ref={logRef} 
              className="p-4 bg-gray-800 h-[32rem] overflow-y-auto font-mono text-xs space-y-1.5"
            >
              {logs.map((log, i) => {
                const isError = log.includes('❌');
                const isSuccess = log.includes('✅');
                const isWarning = log.includes('⚠️');
                
                return (
                  <div 
                    key={i} 
                    className={`${
                      isError ? 'text-red-400' : 
                      isSuccess ? 'text-green-400' :
                      isWarning ? 'text-yellow-300' : 
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
              
              {logs.length === 0 && (
                <div className="text-gray-500 italic">No logs yet. Click "Run Tests" to start.</div>
              )}
            </div>
          </div>
          
          {/* Test Results */}
          <div className="border border-gray-700 rounded-lg shadow-lg bg-gray-800">
            <div className="bg-gray-800 p-4 border-b border-gray-700 font-semibold text-blue-400">
              Test Results
            </div>
            <div className="p-4 bg-gray-800 h-[32rem] overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500 italic">No test results yet.</div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, i) => (
                    <div key={i} className={`p-4 rounded-md border ${
                      result.success ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'
                    }`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{result.testName}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          result.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      
                      <div className="mt-3 space-y-2 text-gray-300">
                        <div><span className="font-medium text-blue-400">Endpoint:</span> {result.endpoint}</div>
                        <div><span className="font-medium text-blue-400">Project ID:</span> {result.projectId}</div>
                        <div><span className="font-medium text-blue-400">Duration:</span> {result.duration.toFixed(0)}ms</div>
                        
                        {result.error && (
                          <div className="mt-3 p-3 bg-red-900/30 rounded border border-red-800 text-red-300">
                            <span className="font-medium">Error:</span> {result.error}
                          </div>
                        )}
                        
                        {result.headers && (
                          <div className="mt-3">
                            <div className="font-medium text-blue-400 mb-1">Headers:</div>
                            <pre className="p-3 bg-gray-900 rounded overflow-x-auto text-gray-300 border border-gray-700">
                              {JSON.stringify(result.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {result.data && (
                          <div className="mt-3">
                            <div className="font-medium text-blue-400 mb-1">Response:</div>
                            <pre className="p-3 bg-gray-900 rounded overflow-x-auto text-gray-300 border border-gray-700">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-900/30 p-6 rounded-lg border border-yellow-800/50 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-300">Troubleshooting Notes</h2>
          <ul className="list-disc list-inside space-y-2 text-yellow-100">
            <li>Project ID errors may indicate you're using a wrong or revoked project ID. Verify it in the Appwrite console.</li>
            <li>Check if the Project ID is correctly set in headers - it should be present as 'X-Appwrite-Project' header.</li>
            <li>Endpoint issues could mean the Appwrite server is down or the URL is incorrect.</li>
            <li>If direct fetch works but SDK doesn't, the issue might be with how the SDK is initializing.</li>
            <li>CORS issues might prevent browser requests - check if the Appwrite platform allows requests from your domain.</li>
            <li>Make sure your Appwrite project is active and not archived or disabled.</li>
          </ul>
        </div>
        
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Additional Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-100">
            <li>Open browser developer tools (F12) and check the Network tab for failed requests</li>
            <li>Look for CORS errors, authorization failures, or network timeouts</li>
            <li>Check if your Appwrite account has rate limits that might be affecting requests</li>
            <li>Try accessing the Appwrite console directly to confirm your credentials are working</li>
            <li>Verify that your environment variables are being loaded correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}