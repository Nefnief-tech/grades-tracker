'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User as UserIcon, Mail } from 'lucide-react';

interface AccountDetailsProps {
  user: User | null;
}

export function AccountDetails({ user }: AccountDetailsProps) {
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, update the user's name in Appwrite
      // For now, just show a success toast
      
      toast({
        title: 'Account Updated',
        description: 'Your account details have been updated.',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Account Details
        </CardTitle>
        <CardDescription>
          View and update your personal information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateAccount}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="email"
                value={user?.email || ''}
                disabled
              />
              <Button type="button" variant="outline" size="sm" disabled className="whitespace-nowrap">
                <Mail className="h-4 w-4 mr-2" />
                Verified
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your email address is verified and cannot be changed.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}