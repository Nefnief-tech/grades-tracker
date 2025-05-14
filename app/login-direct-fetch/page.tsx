'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { directApi } from '@/lib/appwrite-direct-fetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function DirectFetchLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('[DirectFetchLogin] Attempting login with email:', email);
      await directApi.account.createSession(email, password);
      console.log('[DirectFetchLogin] Login successful');
      
      // Get user information
      const user = await directApi.account.get();
      console.log('[DirectFetchLogin] User loaded:', user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('[DirectFetchLogin] Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login with Direct API</CardTitle>
          <CardDescription>
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 rounded-md p-3 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-800 dark:text-red-300 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="#" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)} 
              />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> This login page bypasses the Appwrite SDK completely 
                and uses direct fetch API requests with hardcoded Project ID: 
                <span className="font-mono ml-1">67d6ea990025fa097964</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : 'Sign in'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <span>Don't have an account?</span>
              <Link 
                href="/signup" 
                className="text-primary hover:underline ml-1"
              >
                Sign up
              </Link>
            </div>
            
            <div className="text-center text-xs text-muted-foreground">
              <Link 
                href="/direct-fetch-test" 
                className="hover:underline"
              >
                View API Test Page
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}