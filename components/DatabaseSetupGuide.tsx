'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const REQUIRED_COLLECTIONS = [
  {
    id: '6857419200146011ad19',
    name: 'Team Invites',
    description: 'Stores team invitation data (EXISTING)',
    status: 'exists',
    attributes: [
      'teamId (String, 50, Required)',
      'teamName (String, 100, Required)', 
      'inviterUserId (String, 50, Required)',
      'inviterName (String, 100, Required)',
      'inviteeEmail (String, 100, Required)',
      'role (String, 20, Required)',
      'message (String, 500, Optional)',
      'status (String, 20, Required)',
      'inviteCode (String, 50, Required)',
      'expiresAt (DateTime, Required)',
      'createdAt (DateTime, Required)',
      'acceptedAt (DateTime, Optional)',
      'acceptedBy (String, 50, Optional)',
      'declinedAt (DateTime, Optional)'
    ]
  },
  {
    id: 'channel_invites',
    name: 'Channel Invites',
    description: 'Stores channel invitation data',
    status: 'needed',
    attributes: [
      'channelId (String, 50, Required)',
      'channelName (String, 100, Required)',
      'teamId (String, 50, Required)',
      'inviterUserId (String, 50, Required)',
      'inviterName (String, 100, Required)',
      'inviteeEmail (String, 100, Required)',
      'message (String, 500, Optional)',
      'status (String, 20, Required)',
      'inviteCode (String, 50, Required)',
      'expiresAt (DateTime, Required)',
      'createdAt (DateTime, Required)',
      'acceptedAt (DateTime, Optional)',
      'declinedAt (DateTime, Optional)'
    ]
  },
  {
    id: 'team_members',
    name: 'Team Members',
    description: 'Stores team membership data',
    status: 'needed',
    attributes: [
      'teamId (String, 50, Required)',
      'userId (String, 50, Optional)',
      'userEmail (String, 100, Required)',
      'userName (String, 100, Required)',
      'userAvatar (String, 255, Optional)',
      'role (String, 20, Required)',
      'status (String, 20, Required)',
      'invitedBy (String, 50, Required)',
      'invitedAt (DateTime, Required)',
      'joinedAt (DateTime, Optional)'
    ]
  }
];

export default function DatabaseSetupGuide() {
  const { toast } = useToast();
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Collection ID copied successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Database Setup Required:</strong> The invite system requires specific collections to be created in your Appwrite database.
          Currently, the system is using fallback methods, but for full functionality, please create these collections manually.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Required Collections Setup
          </CardTitle>
          <CardDescription>
            Create these collections in your Appwrite Console to enable full invite functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            <p className="mb-2"><strong>Steps to create collections:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Appwrite Console</li>
              <li>Navigate to Databases → Your Database</li>
              <li>Click "Create Collection"</li>
              <li>Use the exact Collection ID shown below</li>
              <li>Add all the required attributes</li>
              <li>Set proper permissions (Read: Any, Create/Update/Delete: Users)</li>
            </ol>
          </div>          {REQUIRED_COLLECTIONS.map((collection) => (
            <Card key={collection.id} className={`border-l-4 ${collection.status === 'exists' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {collection.name}
                      {collection.status === 'exists' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(collection.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                    <CardDescription>{collection.description}</CardDescription>
                  </div>
                  <Badge variant={collection.status === 'exists' ? 'default' : 'outline'} className="font-mono text-xs">
                    {collection.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedCollection(
                    expandedCollection === collection.id ? null : collection.id
                  )}
                  className="mb-3"
                  disabled={collection.status === 'exists'}
                >
                  {collection.status === 'exists' 
                    ? '✅ Already Created' 
                    : expandedCollection === collection.id 
                      ? 'Hide' 
                      : 'Show'} Attributes
                </Button>
                
                {expandedCollection === collection.id && (
                  <div className="mt-3">
                    <h4 className="font-medium mb-2">Required Attributes:</h4>
                    <div className="grid gap-2">
                      {collection.attributes.map((attr, index) => (
                        <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                          {attr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Team Invites Ready:</strong> The team_invites collection (ID: 6857419200146011ad19) is already created and ready to use!
              You still need to create the channel_invites and team_members collections for full functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}