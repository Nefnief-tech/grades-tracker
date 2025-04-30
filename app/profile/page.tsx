'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AccountDetails } from '@/components/AccountDetails';
import { useAuth } from '@/contexts/AuthContext';
import { MFASettings } from '@/components/MFASettings';

export default function ProfilePage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and security preferences.
        </p>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <AccountDetails user={user} />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <MFASettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
