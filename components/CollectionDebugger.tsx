'use client';

import { useState } from 'react';
import { getDatabases } from '@/lib/appwrite';
import { DATABASE_ID } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const REQUIRED_COLLECTIONS = [
  {
    id: 'teams',
    name: 'Teams',
    attributes: ['name', 'description', 'ownerId', 'isPublic', 'maxMembers', 'memberCount', 'createdAt', 'updatedAt']
  },
  {
    id: 'team_members',
    name: 'Team Members',
    attributes: ['teamId', 'userId', 'userEmail', 'userName', 'role', 'status', 'invitedBy', 'joinedAt', 'invitedAt']
  },
  {
    id: 'chat_channels',
    name: 'Chat Channels',
    attributes: ['teamId', 'name', 'description', 'type', 'isPrivate', 'createdBy', 'messageCount', 'createdAt']
  },
  {
    id: 'chat_messages',
    name: 'Chat Messages',
    attributes: ['channelId', 'teamId', 'userId', 'userName', 'content', 'type', 'isEdited', 'createdAt']
  }
];

export default function CollectionDebugger() {
  const [results, setResults] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkCollections = async () => {
    setIsChecking(true);
    const databases = getDatabases();
    const checkResults = [];

    for (const collection of REQUIRED_COLLECTIONS) {
      try {
        // Try to list documents to check if collection exists
        await databases.listDocuments(DATABASE_ID, collection.id, []);
        
        checkResults.push({
          ...collection,
          exists: true,
          error: null
        });
      } catch (error: any) {
        checkResults.push({
          ...collection,
          exists: false,
          error: error.message
        });
      }
    }

    setResults(checkResults);
    setIsChecking(false);
  };

  const getStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge className="bg-green-100 text-green-800">Exists</Badge>
    ) : (
      <Badge variant="destructive">Missing</Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Collection Setup Debugger</CardTitle>
        <CardDescription>
          Check if your Appwrite collections are properly configured for the teams & chat system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkCollections} disabled={isChecking}>
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Collections
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Collection Status:</h3>
            
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.exists)}
                    <h4 className="font-medium">{result.name}</h4>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {result.id}
                    </code>
                  </div>
                  {getStatusBadge(result.exists)}
                </div>

                {!result.exists && result.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      <strong>Error:</strong> {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {result.exists && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      Required attributes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.attributes.map((attr: string) => (
                        <Badge key={attr} variant="outline" className="text-xs">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Summary */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Summary:</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✅ {results.filter(r => r.exists).length} collections exist
                </span>
                <span className="text-red-600">
                  ❌ {results.filter(r => !r.exists).length} collections missing
                </span>
              </div>
              
              {results.some(r => !r.exists) && (
                <Alert className="mt-3">
                  <AlertDescription>
                    <strong>Action needed:</strong> Please create the missing collections in your Appwrite console. 
                    Check the <code>/docs/appwrite-setup-guide.md</code> file for detailed setup instructions.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}