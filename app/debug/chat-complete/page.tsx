'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debugChatSystem, sendTeamMessage, getTeamMessages, testDirectMessage, fixAllTeamOwnership } from '@/lib/teams-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function ChatDebugPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamId, setTeamId] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from test!');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runDebugTest = async () => {
    if (!user || !teamId) {
      toast({
        title: "Missing Info",
        description: "Please ensure you're logged in and enter a team ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔧 Running debug test with:', { teamId, userId });
      
      const result = await debugChatSystem(teamId, userId);
      setDebugResult(result);
      
      if (result.error) {
        toast({
          title: "Debug Test Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Debug Test Completed",
          description: `Messages: ${result.messagesRetrieved}`,
        });
      }
      
    } catch (error) {
      console.error('Error running debug test:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runDirectTest = async () => {
    if (!user || !teamId) {
      toast({
        title: "Missing Info",
        description: "Please ensure you're logged in and enter a team ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🧪 Running direct test with:', { teamId, userId });
      
      const result = await testDirectMessage(teamId, userId);
      setDebugResult(result);
      
      if (!result.success) {
        toast({
          title: "Direct Test Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Direct Test Completed",
          description: `Message created: ${result.messageCreated}, Messages found: ${result.messagesFound}`,
        });
      }
      
    } catch (error) {
      console.error('Error running direct test:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fixTeamOwnership = async () => {
    if (!user) {
      toast({
        title: "Missing Info",
        description: "Please ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('🔧 Fixing team ownership for user:', userId);
      
      const results = await fixAllTeamOwnership(userId);
      setDebugResult({ 
        ownershipFixed: true, 
        results: results,
        fixedCount: results.filter(r => r.status === 'fixed').length,
        failedCount: results.filter(r => r.status === 'failed').length
      });
      
      toast({
        title: "Ownership Fix Completed",
        description: `Fixed: ${results.filter(r => r.status === 'fixed').length}, Failed: ${results.filter(r => r.status === 'failed').length}`,
      });
      
    } catch (error) {
      console.error('Error fixing ownership:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!user || !teamId || !testMessage) return;

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      
      await sendTeamMessage(teamId, userId, testMessage);
      setTestMessage('');
      
      // Reload messages
      const updatedMessages = await getTeamMessages(teamId, userId);
      setMessages(updatedMessages as any[]);
      
      toast({
        title: "Message Sent",
        description: "Test message sent successfully!",
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!user || !teamId) return;

    setLoading(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      const teamMessages = await getTeamMessages(teamId, userId);
      setMessages(teamMessages as any[]);
      
      toast({
        title: "Messages Loaded",
        description: `Found ${teamMessages.length} messages`,
      });
      
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Failed to load messages",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
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
            <p>Please log in to use the chat debug tool</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat Debug Tool</CardTitle>
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
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={fixTeamOwnership} disabled={loading} variant="secondary">
              {loading ? 'Fixing...' : 'Fix Team Ownership'}
            </Button>
            <Button onClick={runDebugTest} disabled={loading || !teamId}>
              {loading ? 'Testing...' : 'Run Debug Test'}
            </Button>
            <Button onClick={runDirectTest} disabled={loading || !teamId} variant="outline">
              {loading ? 'Testing...' : 'Direct DB Test'}
            </Button>
            <Button variant="outline" onClick={loadMessages} disabled={loading || !teamId}>
              Load Messages
            </Button>
          </div>
          
          {debugResult && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Debug Result:</h3>
              <pre className="text-sm">{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Message:</label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type a test message..."
            />
          </div>
          
          <Button onClick={sendTestMessage} disabled={loading || !teamId || !testMessage}>
            {loading ? 'Sending...' : 'Send Test Message'}
          </Button>
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Messages ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div key={message.$id || index} className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground">
                    {message.userName || message.userId} • {new Date(message.createdAt).toLocaleString()}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>FIRST:</strong> Click "Fix Team Ownership" to set proper owner fields</li>
            <li>Enter a team ID from your teams list (copy from URL: 685834d60030e99e1ef6)</li>
            <li>Click "Run Debug Test" to test the complete chat system</li>
            <li>Click "Direct DB Test" to test direct database writes</li>
            <li>Check the console for detailed logs</li>
            <li>Try sending a test message to verify the system works</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}