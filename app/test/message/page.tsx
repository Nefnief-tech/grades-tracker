'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { testDirectMessage } from '@/lib/teams-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MessageTestPage() {
  const { user } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    if (!user || !teamId) {
      alert('Please log in and enter a team ID');
      return;
    }

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🧪 Running direct message test...');
      
      const testResult = await testDirectMessage(teamId, userId);
      setResult(testResult);
      
      console.log('🎯 Test result:', testResult);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to test messaging</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Direct Message Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Team ID:</label>
            <Input
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter team ID to test..."
            />
          </div>
          
          <Button onClick={runTest} disabled={loading || !teamId}>
            {loading ? 'Testing Database...' : 'Test Direct Database Write'}
          </Button>
          
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <div className="space-y-2 text-sm">
                  <div>✅ Success: {result.success ? 'YES' : 'NO'}</div>
                  <div>🔐 Team Access: {result.teamAccess ? 'YES' : 'NO'}</div>
                  <div>💾 Message Created: {result.messageCreated ? 'YES' : 'NO'}</div>
                  <div>📥 Messages Found: {result.messagesFound || 0}</div>
                  {result.messageId && <div>📝 Message ID: {result.messageId}</div>}
                  {result.error && <div className="text-red-600">❌ Error: {result.error}</div>}
                </div>
              </div>
              
              {result.allMessages && result.allMessages.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Retrieved Messages:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result.allMessages, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a team ID from your teams (get this from /teams page)</li>
            <li>Click "Test Direct Database Write" to test if messages can be saved</li>
            <li>Check the browser console for detailed logs</li>
            <li>This test bypasses all other functions and writes directly to the database</li>
            <li>If this fails, your database collection setup needs to be fixed</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}