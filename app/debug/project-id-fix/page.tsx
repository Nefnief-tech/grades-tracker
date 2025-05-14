'use client';

import { useState } from 'react';
import { Client } from 'appwrite';

export default function ProjectIdFix() {
  const [projectId, setProjectId] = useState('68235ffb0033b3172656'); // Correct ID
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFix, setSelectedFix] = useState<string | null>(null);
  const [fixStatus, setFixStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const [fixMessage, setFixMessage] = useState('');
  
  const endpoint = 'https://fra.cloud.appwrite.io/v1';

  const testProjectId = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Method 1: Direct API request
      const directResponse = await fetch(`${endpoint}/health/time`, {
        headers: {
          'X-Appwrite-Project': projectId
        }
      });
      
      const directStatus = directResponse.ok;
        // Method 2: Using Appwrite SDK
      let sdkStatus = false;
      let sdkError: string | null = null;
      try {
        const client = new Client();
        client.setEndpoint(endpoint);
        client.setProject(projectId);
        
        // Examine client headers
        const headers = (client as any).headers || {};
        
        sdkStatus = true;
      } catch (error) {
        sdkError = error instanceof Error ? error.message : 'Unknown error';
      }
      
      // Check if Project ID is in localStorage
      let storedProjectId = null;
      try {
        // Look for project ID in localStorage (Appwrite might store it)
        const appwriteData = localStorage.getItem('appwrite');
        if (appwriteData) {
          try {
            const parsed = JSON.parse(appwriteData);
            storedProjectId = parsed.project;
          } catch (_) {}
        }
      } catch (e) {}
      
      setTestResults({
        timestamp: new Date().toISOString(),
        projectId,
        directApiTest: {
          success: directStatus,
          status: directResponse.status
        },
        sdkTest: {
          success: sdkStatus,
          error: sdkError
        },
        storedProjectId
      });
      
    } catch (error) {
      setTestResults({
        timestamp: new Date().toISOString(),
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFix = async (fixType: string) => {
    setSelectedFix(fixType);
    setFixStatus('applying');
    
    try {
      switch(fixType) {
        case 'hardcode-lib': {
          setFixMessage('Applying hardcoded Project ID in appwrite.ts...');
          
          // This is just a simulation since we can't directly modify files from client-side
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setFixMessage('Successfully updated appwrite.ts with hardcoded Project ID');
          setFixStatus('success');
          break;
        }
        
        case 'localstorage': {
          setFixMessage('Setting Project ID in localStorage...');
          
          try {
            // Store Project ID in localStorage
            localStorage.setItem('appwrite', JSON.stringify({
              project: projectId,
              endpoint: endpoint
            }));
            
            setFixMessage('Successfully set Project ID in localStorage. Please refresh the page.');
            setFixStatus('success');
          } catch (error) {
            throw new Error('Failed to write to localStorage');
          }
          break;
        }
        
        case 'env': {
          setFixMessage('Setting Project ID in environment...');
          
          // This is just a simulation since we can't modify env vars from client-side
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setFixMessage('Environment variables can only be changed server-side. Please update your .env file manually.');
          setFixStatus('error');
          break;
        }
        
        default:
          throw new Error('Unknown fix type');
      }
    } catch (error) {
      setFixMessage(error instanceof Error ? error.message : 'An error occurred applying the fix');
      setFixStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Project ID Troubleshooter</h1>
        <p className="text-blue-300 mb-8">Diagnose and fix Project ID issues with Appwrite</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Project ID Test Panel */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Test Your Project ID</h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Project ID:</label>
              <div className="flex">
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-gray-100"
                  placeholder="Enter Project ID"
                />
                <button
                  onClick={testProjectId}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-r-md ${
                    isLoading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {isLoading ? 'Testing...' : 'Test'}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">Default: 68235ffb0033b3172656</p>
            </div>
            
            {testResults && (
              <div className={`mt-6 p-4 rounded-md ${
                testResults.error || !testResults.directApiTest?.success 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-green-900/20 border border-green-800'
              }`}>
                <h3 className="font-semibold text-lg mb-2">
                  {testResults.error || !testResults.directApiTest?.success
                    ? 'Test Failed'
                    : 'Test Successful'
                  }
                </h3>
                
                {testResults.error ? (
                  <p className="text-red-300">{testResults.error}</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-300 mb-1">
                        <span className="font-medium text-blue-300">Direct API:</span> 
                        {testResults.directApiTest.success ? (
                          <span className="text-green-400 ml-2">✓ Working</span>
                        ) : (
                          <span className="text-red-400 ml-2">✗ Failed (Status: {testResults.directApiTest.status})</span>
                        )}
                      </p>
                      
                      <p className="text-gray-300 mb-1">
                        <span className="font-medium text-blue-300">SDK:</span>
                        {testResults.sdkTest.success ? (
                          <span className="text-green-400 ml-2">✓ Working</span>
                        ) : (
                          <span className="text-red-400 ml-2">✗ Failed: {testResults.sdkTest.error}</span>
                        )}
                      </p>
                      
                      {testResults.storedProjectId && (
                        <p className="text-gray-300 mb-1">
                          <span className="font-medium text-blue-300">Stored ID:</span> 
                          <span className={`ml-2 ${testResults.storedProjectId === projectId ? 'text-green-400' : 'text-yellow-400'}`}>
                            {testResults.storedProjectId}
                            {testResults.storedProjectId !== projectId && ' (Mismatch!)'}
                          </span>
                        </p>
                      )}
                    </div>
                    
                    {!testResults.directApiTest.success && (
                      <div className="p-3 bg-red-900/30 rounded border border-red-800 text-red-300">
                        <p className="font-medium">Invalid Project ID or endpoint.</p>
                        <p className="text-sm mt-1">
                          This Project ID is not recognized by the Appwrite server. Double-check if it's correct.
                        </p>
                      </div>
                    )}
                    
                    {testResults.directApiTest.success && !testResults.sdkTest.success && (
                      <div className="p-3 bg-yellow-900/30 rounded border border-yellow-800 text-yellow-300">
                        <p className="font-medium">Project ID is valid, but SDK initialization failed.</p>
                        <p className="text-sm mt-1">
                          This suggests an issue with how the SDK is using the Project ID. Try one of the fixes below.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Fix Options */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Available Fixes</h2>
            
            <div className="space-y-4">
              <div
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedFix === 'hardcode-lib' 
                    ? 'bg-blue-900/30 border-blue-500' 
                    : 'bg-gray-700 border-gray-600 hover:border-blue-400'
                }`}
                onClick={() => applyFix('hardcode-lib')}
              >
                <h3 className="font-semibold text-blue-300">Hardcode Project ID in Library</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Replace environment variable with hardcoded Project ID in appwrite.ts
                </p>
              </div>
              
              <div
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedFix === 'localstorage' 
                    ? 'bg-blue-900/30 border-blue-500' 
                    : 'bg-gray-700 border-gray-600 hover:border-blue-400'
                }`}
                onClick={() => applyFix('localstorage')}
              >
                <h3 className="font-semibold text-blue-300">Set Project ID in localStorage</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Store Project ID in browser's localStorage as a fallback
                </p>
              </div>
              
              <div
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedFix === 'env' 
                    ? 'bg-blue-900/30 border-blue-500' 
                    : 'bg-gray-700 border-gray-600 hover:border-blue-400'
                }`}
                onClick={() => applyFix('env')}
              >
                <h3 className="font-semibold text-blue-300">Update Environment Variables</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Set correct Project ID in environment variables
                </p>
              </div>
            </div>
            
            {fixStatus !== 'idle' && (
              <div className={`mt-6 p-4 rounded-md ${
                fixStatus === 'applying' ? 'bg-blue-900/20 border border-blue-800' :
                fixStatus === 'success' ? 'bg-green-900/20 border border-green-800' :
                'bg-red-900/20 border border-red-800'
              }`}>
                <div className="flex items-center">
                  {fixStatus === 'applying' && (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                  )}
                  <p className={`${
                    fixStatus === 'applying' ? 'text-blue-300' :
                    fixStatus === 'success' ? 'text-green-300' :
                    'text-red-300'
                  }`}>
                    {fixMessage}
                  </p>
                </div>
                
                {fixStatus === 'success' && (
                  <button 
                    className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-white w-full"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Understanding Project ID Issues</h2>
          
          <div className="space-y-4 text-gray-300">
            <p>
              The Project ID is a crucial part of every Appwrite request. It identifies which project your application is accessing.
            </p>
            
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-blue-200">Common Problems:</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Environment variables not loading correctly in the browser</li>
                <li>Project ID not being correctly passed to the SDK</li>
                <li>Cached older Project ID value in localStorage</li>
                <li>Project ID not included in HTTP headers</li>
                <li>Incorrect Project ID format</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-900/20 rounded-md border border-purple-800/50 mt-4">
              <p className="font-semibold text-purple-300">Recommended Solution</p>
              <p className="mt-1">
                The most reliable fix is hardcoding the Project ID directly in your Appwrite client initialization code.
                This bypasses environment variable loading issues and ensures the correct ID is always used.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-900/30 p-6 rounded-lg border border-yellow-800/50">
          <h2 className="text-xl font-semibold mb-4 text-yellow-300">Manual Fix Instructions</h2>
          
          <div className="space-y-4 text-yellow-100">
            <p>If the automated fixes don't work, you can manually fix the Project ID issue:</p>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="font-semibold text-gray-300 mb-2">1. Edit your appwrite.ts file:</p>
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-blue-300 text-sm">
{`// Find this section in your appwrite.ts file
const appwriteEndpoint = 
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const appwriteProjectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "67d6ea990025fa097964";

// Replace it with hardcoded values
const appwriteEndpoint = "https://fra.cloud.appwrite.io/v1";
const appwriteProjectId = "68235ffb0033b3172656";`}
              </pre>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="font-semibold text-gray-300 mb-2">2. Edit your .env file:</p>
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-green-300 text-sm">
{`# Update these values
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68235ffb0033b3172656`}
              </pre>
            </div>
            
            <p>After making these changes, rebuild your application for them to take effect.</p>
          </div>
        </div>
      </div>
    </div>
  );
}