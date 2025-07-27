'use client';

import { useState } from 'react';
import { getDatabases } from '@/lib/appwrite';
import { DATABASE_ID } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DetailedCollectionDebugger() {
  const [collectionDetails, setCollectionDetails] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string>('');

  const checkTeamsCollection = async () => {
    setIsChecking(true);
    setError('');
    
    try {
      const databases = getDatabases();
      
      // Try to get the collection details directly
      const response = await fetch(`https://appwrite.nief.tech/v1/databases/${DATABASE_ID}/collections/teams`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': '67d6ea990025fa097964',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const collectionData = await response.json();
        setCollectionDetails(collectionData);
      } else {
        setError('Could not fetch collection details. Collection might not exist.');
      }
      
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const requiredAttributes = [
    { key: 'name', type: 'string', required: true },
    { key: 'description', type: 'string', required: false },
    { key: 'ownerId', type: 'string', required: true }, // This is the missing one!
    { key: 'isPublic', type: 'boolean', required: true },
    { key: 'maxMembers', type: 'integer', required: true },
    { key: 'memberCount', type: 'integer', required: true },
    { key: 'createdAt', type: 'datetime', required: true },
    { key: 'updatedAt', type: 'datetime', required: true }
  ];

  const checkAttribute = (attrKey: string) => {
    if (!collectionDetails?.attributes) return { exists: false, matches: false };
    
    const found = collectionDetails.attributes.find((attr: any) => attr.key === attrKey);
    return {
      exists: !!found,
      matches: found ? found.type === requiredAttributes.find(r => r.key === attrKey)?.type : false,
      details: found
    };
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Teams Collection Detailed Debug</CardTitle>
        <CardDescription>
          Check the exact structure of your teams collection and identify missing attributes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button onClick={checkTeamsCollection} disabled={isChecking}>
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking Collection...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Teams Collection
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {collectionDetails && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Collection Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">ID:</span>
                <code>{collectionDetails.$id}</code>
                <span className="text-muted-foreground">Name:</span>
                <span>{collectionDetails.name}</span>
                <span className="text-muted-foreground">Total Attributes:</span>
                <span>{collectionDetails.attributes?.length || 0}</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Required Attributes Check</h3>
              <div className="space-y-2">
                {requiredAttributes.map((reqAttr) => {
                  const check = checkAttribute(reqAttr.key);
                  return (
                    <div key={reqAttr.key} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {check.exists ? (
                          check.matches ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <code className="font-medium">{reqAttr.key}</code>
                        <span className="text-sm text-muted-foreground">
                          ({reqAttr.type}, {reqAttr.required ? 'required' : 'optional'})
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {check.exists ? (
                          check.matches ? (
                            <Badge className="bg-green-100 text-green-800">Perfect</Badge>
                          ) : (
                            <Badge variant="secondary">Type Mismatch</Badge>
                          )
                        ) : (
                          <Badge variant="destructive">Missing!</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {collectionDetails.attributes && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Current Attributes in Collection</h3>
                <div className="space-y-1">
                  {collectionDetails.attributes.map((attr: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                      <code>{attr.key}</code>
                      <Badge variant="outline">{attr.type}</Badge>
                      {attr.required && <Badge variant="secondary">Required</Badge>}
                      {attr.array && <Badge variant="secondary">Array</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Quick Fix:</strong> The most likely issue is that the <code>ownerId</code> attribute 
                is missing from your collection. Go to your Appwrite Console → Databases → teams collection 
                → Add the missing attributes shown in red above.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}