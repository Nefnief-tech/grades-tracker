'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw } from 'lucide-react';

export default function MFADebugInfo() {
  const [mfaInfo, setMfaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkMFAStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!account) {
        throw new Error('Account service not available');
      }

      console.log('Checking MFA factors...');
      
      // Try to list MFA factors
      try {
        const factors = await account.listMfaFactors();
        console.log('MFA Factors:', factors);
        setMfaInfo({ type: 'factors', data: factors });
      } catch (factorError: any) {
        console.log('Could not list factors:', factorError);
        
        // Try to create a test challenge to see what happens
        try {
          const totpChallenge = await account.createMfaChallenge('totp' as any);
          console.log('TOTP challenge successful:', totpChallenge);
          setMfaInfo({ type: 'totp_success', data: totpChallenge });
        } catch (totpError: any) {
          console.log('TOTP challenge failed:', totpError);
          
          try {
            const emailChallenge = await account.createMfaChallenge('email' as any);
            console.log('Email challenge successful:', emailChallenge);
            setMfaInfo({ type: 'email_success', data: emailChallenge });
          } catch (emailError: any) {
            console.log('Email challenge failed:', emailError);
            setMfaInfo({ 
              type: 'no_methods', 
              data: { 
                totpError: totpError.message, 
                emailError: emailError.message 
              } 
            });
          }
        }
      }
    } catch (error: any) {
      console.error('MFA debug failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <CardTitle>MFA Debug Information</CardTitle>
        </div>
        <CardDescription>
          Debug information about your 2FA configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkMFAStatus} disabled={loading} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? 'Checking...' : 'Refresh MFA Status'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mfaInfo && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">MFA Status:</h3>
            
            {mfaInfo.type === 'factors' && (
              <div>
                <p className="text-sm text-green-600 mb-2">✅ MFA Factors Found</p>
                <pre className="text-xs bg-background p-2 rounded overflow-auto">
                  {JSON.stringify(mfaInfo.data, null, 2)}
                </pre>
              </div>
            )}

            {mfaInfo.type === 'totp_success' && (
              <div>
                <p className="text-sm text-blue-600 mb-2">📱 TOTP Challenge Created</p>
                <p className="text-xs">Challenge ID: {mfaInfo.data.$id}</p>
              </div>
            )}

            {mfaInfo.type === 'email_success' && (
              <div>
                <p className="text-sm text-blue-600 mb-2">📧 Email Challenge Created</p>
                <p className="text-xs">Challenge ID: {mfaInfo.data.$id}</p>
              </div>
            )}

            {mfaInfo.type === 'no_methods' && (
              <div>
                <p className="text-sm text-red-600 mb-2">❌ No MFA Methods Available</p>
                <div className="text-xs space-y-1">
                  <p><strong>TOTP Error:</strong> {mfaInfo.data.totpError}</p>
                  <p><strong>Email Error:</strong> {mfaInfo.data.emailError}</p>
                </div>
                <p className="text-sm text-yellow-600 mt-2">
                  → User needs to set up 2FA methods
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}