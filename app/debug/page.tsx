'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Client } from 'appwrite';

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    endpoint?: { value: string, valid: boolean },
    projectId?: { value: string, valid: boolean },
    databaseId?: { value: string, valid: boolean },
  }>({});
  const [testResults, setTestResults] = useState<any>(null);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customProjectId, setCustomProjectId] = useState('');
  
  useEffect(() => {
    // Check environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    setConfigStatus({
      endpoint: { value: endpoint || '', valid: !!endpoint },
      projectId: { value: projectId || '', valid: !!projectId },
      databaseId: { value: databaseId || '', valid: !!databaseId },
    });
    
    // Initialize with current values
    setCustomEndpoint(endpoint || '');
    setCustomProjectId(projectId || '');
  }, []);
  
  const testConnection = async () => {
    setLoading(true);
    setTestResults(null);
    
    try {
      // Create a test client
      const client = new Client();
      
      // Use custom values if provided, otherwise use the env vars
      const endpoint = customEndpoint || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = customProjectId || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      
      client.setEndpoint(endpoint || '');
      client.setProject(projectId || '');
      
      // Test simple anonymous endpoint
      try {
        const response = await fetch('/api/debug/test-appwrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint,
            projectId
          })
        });
        
        const data = await response.json();
        setTestResults(data);
      } catch (error: any) {
        setTestResults({
          success: false,
          error: error.message,
          message: 'API test request failed'
        });
      }
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        message: 'Client initialization failed'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateRunningConfig = () => {
    try {
      // Store in localStorage for persistence
      localStorage.setItem('debug_appwrite_endpoint', customEndpoint);
      localStorage.setItem('debug_appwrite_project_id', customProjectId);
      
      // This will force a page reload to apply the new values
      window.location.href = '/?debug=1';
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Appwrite Debug Tool</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            These values are loaded from your environment variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">NEXT_PUBLIC_APPWRITE_ENDPOINT</span>
              <span className={configStatus.endpoint?.valid ? 'text-green-500' : 'text-red-500'}>
                {configStatus.endpoint?.value || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">NEXT_PUBLIC_APPWRITE_PROJECT_ID</span>
              <span className={configStatus.projectId?.valid ? 'text-green-500' : 'text-red-500'}>
                {configStatus.projectId?.value || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">NEXT_PUBLIC_APPWRITE_DATABASE_ID</span>
              <span className={configStatus.databaseId?.valid ? 'text-green-500' : 'text-red-500'}>
                {configStatus.databaseId?.value || 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
          <CardDescription>
            Test your Appwrite connection with custom values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="font-medium">Endpoint:</span>
              <Input
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://cloud.appwrite.io/v1"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="font-medium">Project ID:</span>
              <Input
                value={customProjectId}
                onChange={(e) => setCustomProjectId(e.target.value)}
                placeholder="Your project ID"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-between">
          <Button 
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={updateRunningConfig}
          >
            Update Running Config
          </Button>
        </CardFooter>
      </Card>
      
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results from Appwrite connection test
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.success ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Connection Successful</AlertTitle>
                <AlertDescription>
                  {testResults.message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Connection Failed</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{testResults.message}</p>
                  {testResults.error && (
                    <pre className="bg-red-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(testResults.error, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 bg-gray-100 rounded p-4">
              <h4 className="font-medium mb-2">Raw Response:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}