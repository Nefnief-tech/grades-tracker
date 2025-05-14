'use client';

import React, { useState, useEffect } from 'react';
import { directApi, ENDPOINT, PROJECT_ID } from '@/lib/appwrite-direct-fetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function DirectFetchTestPage() {
  // Connection test state
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionData, setConnectionData] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Login test state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginData, setLoginData] = useState<any>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Session test state
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);
  
  // Test connection
  const testConnection = async () => {
    setConnectionStatus('loading');
    setConnectionError(null);
    
    try {
      const result = await directApi.testConnection();
      setConnectionData(result);
      
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Unknown error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      setConnectionData(null);
    }
  };
  
  // Test login
  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('loading');
    setLoginError(null);
    
    try {
      const result = await directApi.account.createSession(email, password);
      setLoginData(result);
      setLoginStatus('success');
      
      // Automatically test session after login
      testSession();
    } catch (error) {
      setLoginStatus('error');
      setLoginError(error instanceof Error ? error.message : 'Unknown error');
      setLoginData(null);
    }
  };
  
  // Test session
  const testSession = async () => {
    setSessionStatus('loading');
    setSessionError(null);
    
    try {
      const result = await directApi.account.getSession();
      setSessionData(result);
      
      if (result) {
        setSessionStatus('success');
      } else {
        setSessionStatus('error');
        setSessionError('No active session found');
      }
    } catch (error) {
      setSessionStatus('error');
      setSessionError(error instanceof Error ? error.message : 'Unknown error');
      setSessionData(null);
    }
  };
  
  // Test logout
  const testLogout = async () => {
    try {
      await directApi.account.deleteSession();
      setSessionStatus('idle');
      setSessionData(null);
      setSessionError(null);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  return (
    <div className="container py-10 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Direct Fetch API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-medium mb-2">Configuration</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Endpoint:</div>
                <div className="font-mono text-xs break-all">{ENDPOINT}</div>
                
                <div className="font-medium">Project ID:</div>
                <div className="font-mono text-xs">{PROJECT_ID}</div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                This test page uses direct fetch requests to the Appwrite API,
                completely bypassing the Appwrite SDK to avoid any compatibility issues.
              </p>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-2">Connection Test</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {connectionStatus === 'loading' ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Testing connection...</span>
                    </div>
                  ) : connectionStatus === 'success' ? (
                    <div className="flex items-center text-green-600 dark:text-green-500">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Connection successful</span>
                    </div>
                  ) : connectionStatus === 'error' ? (
                    <div className="flex items-center text-red-600 dark:text-red-500">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span>Connection failed</span>
                    </div>
                  ) : (
                    <span>Click to test connection</span>
                  )}
                </div>
                
                <Button
                  onClick={testConnection}
                  size="sm"
                  className="whitespace-nowrap"
                  variant={connectionStatus === 'error' ? 'destructive' : 'secondary'}
                  disabled={connectionStatus === 'loading'}
                >
                  {connectionStatus === 'loading' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              
              {connectionError && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                  Error: {connectionError}
                </div>
              )}
              
              {connectionStatus === 'success' && connectionData && (
                <div className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                  <pre>{JSON.stringify(connectionData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login Test</TabsTrigger>
          <TabsTrigger value="session">Session Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Login</CardTitle>
            </CardHeader>
            <form onSubmit={testLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {loginError && (
                  <div className="text-sm text-red-600 dark:text-red-500 p-2 border border-red-200 dark:border-red-900 rounded-md bg-red-50 dark:bg-red-900/20">
                    {loginError}
                  </div>
                )}
                
                {loginStatus === 'success' && loginData && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-2">
                    <div className="flex items-center text-green-700 dark:text-green-500 mb-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Login successful!</span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 max-h-40 overflow-auto">
                      <pre>{JSON.stringify(loginData, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginStatus === 'loading'}
                >
                  {loginStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : 'Test Login'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="session" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  {sessionStatus === 'loading' ? (
                    <div className="flex items-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Checking session...</span>
                    </div>
                  ) : sessionStatus === 'success' ? (
                    <div className="flex items-center text-green-600 dark:text-green-500">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Active session found</span>
                    </div>
                  ) : sessionStatus === 'error' ? (
                    <div className="flex items-center text-amber-600 dark:text-amber-500">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span>No active session</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Click to check session</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={testSession}
                    size="sm"
                    variant="outline"
                    disabled={sessionStatus === 'loading'}
                  >
                    Check Session
                  </Button>
                  
                  <Button
                    onClick={testLogout}
                    size="sm"
                    variant="outline"
                    disabled={sessionStatus !== 'success' || sessionStatus === 'loading'}
                  >
                    Logout
                  </Button>
                </div>
              </div>
              
              {sessionError && (
                <div className="text-sm text-amber-600 dark:text-amber-500">
                  {sessionError}
                </div>
              )}
              
              {sessionStatus === 'success' && sessionData && (
                <div className="bg-muted p-2 rounded overflow-auto max-h-72">
                  <pre className="text-xs">{JSON.stringify(sessionData, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}