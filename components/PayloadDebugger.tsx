'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Code, Database, AlertTriangle } from 'lucide-react';

export default function PayloadDebugger() {
  const { user } = useAuth();
  const [showPayload, setShowPayload] = useState(false);

  const getCreateTeamPayload = () => {
    if (!user) return null;    return {
      name: "Test Team",
      description: "Test Description",
      owner: user.$id, // Changed to 'owner' for simplicity
      isPublic: false,
      maxMembers: 50,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const payload = getCreateTeamPayload();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Payload Debugger
        </CardTitle>
        <CardDescription>
          See exactly what data is being sent to the teams collection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Target Collection:</strong> <code>teams</code> in database <code>67d6b079002144822b5e</code>
            <br />
            <strong>Using attribute:</strong> <code>owner</code> ✅
          </AlertDescription>
        </Alert>        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Status:</strong> The code is using <code>owner</code> - you need to add this attribute to your collection
          </AlertDescription>
        </Alert>

        <div>
          <Button 
            onClick={() => setShowPayload(!showPayload)}
            variant="outline"
          >
            {showPayload ? 'Hide' : 'Show'} Payload Being Sent
          </Button>
        </div>

        {showPayload && payload && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Data Being Sent to teams Collection:</h3>
            <div className="space-y-2">
              {Object.entries(payload).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">                  <Badge 
                    variant={key === 'owner' ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {key}
                  </Badge>
                  <span className="text-sm">:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {typeof value === 'string' ? `"${value}"` : String(value)}
                  </code>
                  {key === 'owner' && (
                    <Badge variant="secondary" className="text-xs">
                      New attribute needed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium mb-3 text-blue-800">What's Happening:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Your code creates a payload with <code>owner: "{user?.$id}"</code></li>
            <li>It sends this to <code>POST /collections/teams/documents</code></li>
            <li>Appwrite checks the <code>teams</code> collection schema</li>
            <li>You need to add the <code>owner</code> attribute to your collection</li>
            <li>Then team creation will work!</li>
          </ol>
        </div>

        <div className="border rounded-lg p-4 bg-green-50">
          <h3 className="font-medium mb-3 text-green-800">Add to Collection:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
            <li>Go to your Appwrite Console</li>
            <li>Navigate to Databases → teams collection → Attributes</li>
            <li>Add new attribute: <code>owner</code> (String, 50 chars, Required)</li>
            <li>Team creation will work immediately after</li>
          </ol>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Status:</strong> Code now uses <code>owner</code> - add this attribute to your collection
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}