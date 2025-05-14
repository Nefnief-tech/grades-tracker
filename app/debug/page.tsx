'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Client } from 'appwrite';

export default function DebugIndexPage() {
  const [appwriteStatus, setAppwriteStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [projectId, setProjectId] = useState('');
  const [endpoint, setEndpoint] = useState('');

  useEffect(() => {
    // Hardcoded values for safety
    const hardcodedProjectId = '68235ffb0033b3172656'; 
    const hardcodedEndpoint = 'https://fra.cloud.appwrite.io/v1';
    
    // Load environment variables with fallbacks to hardcoded values
    setProjectId(hardcodedProjectId);
    setEndpoint(hardcodedEndpoint);
    
    // Check basic Appwrite connectivity
    checkAppwrite(hardcodedEndpoint, hardcodedProjectId);
  }, []);

  const checkAppwrite = async (endpointUrl: string, projectIdValue: string) => {
    try {
      console.log(`Testing Appwrite connection with:
        Endpoint: ${endpointUrl}
        Project ID: ${projectIdValue}`);
      
      // Make a simple health check request with explicit parameters
      const response = await fetch(`${endpointUrl}/health/time`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': projectIdValue,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Appwrite connection successful:', data);
        setAppwriteStatus('success');
      } else {
        const errorText = await response.text();
        console.error('Appwrite connection failed:', {
          status: response.status,
          error: errorText
        });
        setAppwriteStatus('error');
      }
    } catch (error) {
      console.error('Appwrite check failed:', error);
      setAppwriteStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-white border-b border-gray-700 pb-4">Appwrite Debug Console</h1>
        
        {/* Status Card */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Appwrite Status</h2>
          <div className="flex items-start">
            <div 
              className={`mt-1 w-5 h-5 rounded-full mr-3 ${
                appwriteStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 
                appwriteStatus === 'success' ? 'bg-green-500' : 
                'bg-red-500'
              }`}
            ></div>
            <div>
              <p className="font-medium text-lg">
                {appwriteStatus === 'checking' ? 'Checking Appwrite connection...' : 
                appwriteStatus === 'success' ? 'Appwrite is reachable' : 
                'Appwrite connection failed'}
              </p>
              <div className="mt-3 p-3 bg-gray-700 rounded-md">
                <p><strong className="text-blue-300">Project ID:</strong> {projectId}</p>
                <p><strong className="text-blue-300">Endpoint:</strong> {endpoint}</p>
              </div>
              <button 
                onClick={() => checkAppwrite(endpoint, projectId)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DebugCard
            title="Project ID Fix"
            description="Fix Project ID issues with your Appwrite connection"
            href="/debug/project-id-fix"
            icon="🔧"
          />
          
          <DebugCard
            title="Connection Diagnostics"
            description="Full connection testing with detailed diagnostics"
            href="/debug/connection"
            icon="🔌"
          />
          
          <DebugCard
            title="Debug Logs"
            description="View detailed logs from Appwrite initialization and requests"
            href="/debug/logs"
            icon="📋"
          />
          
          <DebugCard
            title="Collections Check"
            description="Verify database and collection IDs are valid"
            href="/debug/collections"
            icon="🗂️"
          />
          
          <DebugCard
            title="Direct API Test"
            description="Test using direct API calls instead of SDK"
            href="/test-direct"
            icon="🔧"
          />
          
          <DebugCard
            title="Client Headers"
            description="Check what headers are being sent to Appwrite"
            href="/debug/check-headers"
            icon="📝"
          />
          
          <DebugCard
            title="Client Initialization"
            description="Monitor how the Appwrite client is initialized"
            href="/debug/check-init"
            icon="🔬"
          />
        </div>
        
        <div className="bg-yellow-900/30 p-6 rounded-lg border border-yellow-800/50 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-300">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-100">
            <li>Verify your Project ID is correct and the project is active in Appwrite Console</li>
            <li>Check if your Appwrite endpoint URL is accessible from your network</li>
            <li>Ensure your project allows requests from your domain (CORS settings)</li>
            <li>Try the Direct API test to see if bypassing the SDK works</li>
            <li>Look for error messages in the Debug Logs</li>
          </ol>
        </div>
        
        <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/50">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Environment Variables</h2>
          <pre className="mt-2 bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto border border-gray-700 text-gray-300">
{`# Current environment variables:
NEXT_PUBLIC_APPWRITE_ENDPOINT=${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set'}
NEXT_PUBLIC_APPWRITE_PROJECT_ID=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set'}
NEXT_PUBLIC_APPWRITE_DATABASE_ID=${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set'}
NEXT_PUBLIC_ENABLE_CLOUD_FEATURES=${process.env.NEXT_PUBLIC_ENABLE_CLOUD_FEATURES || 'Not set'}
NEXT_PUBLIC_DEBUG=${process.env.NEXT_PUBLIC_DEBUG || 'Not set'}`}
          </pre>
          
          <div className="mt-4 text-blue-200">
            <p>
              If needed, set <code className="bg-blue-900 px-2 py-1 rounded">NEXT_PUBLIC_DEBUG=true</code> in 
              your .env file for more detailed logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DebugCard({ title, description, href, icon }: { 
  title: string, 
  description: string, 
  href: string,
  icon: string
}) {
  return (
    <Link href={href}>
      <div className="p-5 bg-gray-800 rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition-colors hover:shadow-lg">
        <div className="flex items-start mb-2">
          <div className="text-2xl mr-3">{icon}</div>
          <h3 className="text-lg font-semibold text-blue-300">{title}</h3>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </Link>
  );
}