'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTeam } from '@/lib/teams-simple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';

export default function TeamCreationTest() {
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testTeamCreation = async () => {
    if (!user) {
      setTestResult({
        success: false,
        error: 'User not logged in'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const testTeam = await createTeam(
        {
          name: `Test Team ${Date.now()}`,
          description: 'Automated test team',
          isPublic: false,
          maxMembers: 10
        },
        user.$id,
        user.name || user.email,
        user.email
      );

      setTestResult({
        success: true,
        team: testTeam,
        message: 'Team created successfully!'
      });

    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Unknown error',
        details: error
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Team Creation Test
        </CardTitle>
        <CardDescription>
          Test if the teams collection is now working with the ownerId attribute
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Collection Status:</strong> teams collection needs owner attribute
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Required Collection Attributes:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'name', 'description', 'isPublic', 'avatar', 
              'maxMembers', 'memberCount', 'createdAt', 
              'updatedAt', 'owner'
            ].map(attr => (
              <Badge 
                key={attr} 
                variant={attr === 'owner' ? "default" : "secondary"}
                className="font-mono"
              >
                {attr}
                {attr === 'owner' && ' (add this)'}
              </Badge>
            ))}
          </div>
        </div><div>
          <Button 
            onClick={testTeamCreation}
            disabled={isTesting || !user}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Team Creation...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Team Creation
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className={`border rounded-lg p-4 ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h3 className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Success!' : 'Test Failed'}
              </h3>
            </div>
            
            <div className={`text-sm ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.success ? (
                <div>
                  <p className="mb-2"><strong>Team Created:</strong> {testResult.team?.name}</p>
                  <p className="mb-2"><strong>Team ID:</strong> {testResult.team?.$id}</p>
                  <p><strong>Message:</strong> {testResult.message}</p>
                </div>
              ) : (
                <div>
                  <p className="mb-2"><strong>Error:</strong> {testResult.error}</p>
                  {testResult.error.includes('Missing required attribute') && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        The ownerId attribute might still be propagating. Try refreshing the page and testing again in a few seconds.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!user && (
          <Alert variant="destructive">
            <AlertDescription>
              Please log in to test team creation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}