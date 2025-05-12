'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { getDatabases } from '@/lib/appwrite';

export function SuspensionBanner() {
  const { user, logout } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    const checkSuspensionStatus = async () => {
      if (!user || !user.id) {
        setIsSuspended(false);
        return;
      }
      
      try {
        // Get the databases instance
        const databases = getDatabases();
        
        // Fetch the user's document from the database to check suspension status
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
        const userCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID || '';
        
        const userDoc = await databases.getDocument(
          databaseId,
          userCollectionId,
          user.id
        );
        
        setIsSuspended(userDoc.is_suspended === true);
      } catch (error) {
        console.error('Error checking suspension status:', error);
        // Default to not suspended if there's an error
        setIsSuspended(false);
      }
    };
    
    checkSuspensionStatus();
  }, [user]);

  if (!isSuspended) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 text-red-900 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Account Suspended</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Your access to this application has been suspended
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Restricted</AlertTitle>
              <AlertDescription>
                Your account has been suspended by an administrator.
                If you believe this is an error, please contact support.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              For more information about this suspension or to appeal this decision, 
              please contact the system administrator or support team.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 rounded-b-lg">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => logout()}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}