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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Appwrite Connection Diagnostics</h1>
      
      <div className="mb-4 flex gap-2">
        <button 
          onClick={runTests}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Testing...' : 'Run Tests'}
        </button>
        
        <button 
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Log Console */}
        <div className="border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-100 p-3 border-b border-gray-200 font-semibold flex justify-between items-center">
            <div>Connection Logs</div>
            <div className="text-xs text-gray-500">{logs.length} entries</div>
          </div>
          <div 
            ref={logRef} 
            className="p-3 bg-gray-50 h-96 overflow-y-auto font-mono text-xs space-y-1"
          >
            {logs.map((log, i) => {
              const isError = log.includes('❌');
              const isSuccess = log.includes('✅');
              const isWarning = log.includes('⚠️');
              
              return (
                <div 
                  key={i} 
                  className={`${
                    isError ? 'text-red-600' : 
                    isSuccess ? 'text-green-600' :
                    isWarning ? 'text-amber-600' : 
                    'text-gray-800'
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
        <div className="border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-100 p-3 border-b border-gray-200 font-semibold">
            Test Results
          </div>
          <div className="p-3 bg-gray-50 h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500 italic">No test results yet.</div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, i) => (
                  <div key={i} className={`p-3 rounded-md border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{result.testName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-xs space-y-1 text-gray-600">
                      <div><span className="font-medium">Endpoint:</span> {result.endpoint}</div>
                      <div><span className="font-medium">Project ID:</span> {result.projectId}</div>
                      <div><span className="font-medium">Duration:</span> {result.duration.toFixed(0)}ms</div>
                      
                      {result.error && (
                        <div className="text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-100">
                          <span className="font-medium">Error:</span> {result.error}
                        </div>
                      )}
                      
                      {result.headers && (
                        <div className="mt-2">
                          <div className="font-medium">Headers:</div>
                          <pre className="p-2 bg-gray-100 rounded overflow-x-auto mt-1">
                            {JSON.stringify(result.headers, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {result.data && (
                        <div className="mt-2">
                          <div className="font-medium">Response:</div>
                          <pre className="p-2 bg-gray-100 rounded overflow-x-auto mt-1">
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
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Notes</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Project ID errors may indicate you're using a wrong or revoked project ID. Verify it in the Appwrite console.</li>
          <li>Endpoint issues could mean the Appwrite server is down or the URL is incorrect.</li>
          <li>If direct fetch works but SDK doesn't, the issue might be with how the SDK is initializing.</li>
          <li>CORS issues might prevent browser requests - check if the Appwrite platform allows requests from your domain.</li>
          <li>Make sure your Appwrite project is active and not archived or disabled.</li>
        </ul>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h2 className="text-lg font-semibold mb-2">Additional Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open browser developer tools (F12) and check the Network tab for failed requests</li>
          <li>Look for CORS errors, authorization failures, or network timeouts</li>
          <li>Check if your Appwrite account has rate limits that might be affecting requests</li>
          <li>Try accessing the Appwrite console directly to confirm your credentials are working</li>
        </ol>
      </div>
    </div>
  );
}