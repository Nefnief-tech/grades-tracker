'use client';

import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Bug } from 'lucide-react';

export default function EmailDebugPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testVerificationEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing verification email for:', email);
      const response = await account?.createVerification('http://localhost:3000/verify-email');
      setResult({ type: 'verification', response });
      console.log('Verification email response:', response);
    } catch (error: any) {
      console.error('Verification email error:', error);
      setError(`Verification error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordReset = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing password reset for:', email);
      const response = await account?.createRecovery(email, 'http://localhost:3000/reset-password');
      setResult({ type: 'recovery', response });
      console.log('Password reset response:', response);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(`Recovery error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAppwriteConfig = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Check if we can get current session/user
      const user = await account?.get();
      setResult({ 
        type: 'config', 
        user: user ? 'User logged in' : 'No user', 
        account: account ? 'Account service available' : 'Account service missing'
      });
    } catch (error: any) {
      console.error('Config check error:', error);
      setError(`Config error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <CardTitle>Email Debug Tool</CardTitle>
          </div>
          <CardDescription>
            Test email functionality and debug Appwrite configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="test-email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to test"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={testVerificationEmail}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Test Verification
            </Button>

            <Button
              onClick={testPasswordReset}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Test Reset
            </Button>

            <Button
              onClick={checkAppwriteConfig}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
              Check Config
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>Test Type:</strong> {result.type}</div>
                  <div><strong>Result:</strong></div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Check Appwrite Console → Auth → Settings → Email Templates</li>
              <li>Verify SMTP configuration in Appwrite Console → Settings → SMTP</li>
              <li>Check if domain is verified for email sending</li>
              <li>Look in spam/junk folder for emails</li>
              <li>Check browser console for detailed error messages</li>
              <li>Verify the email address exists and is accessible</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}