'use client';

import CollectionDebugger from '@/components/CollectionDebugger';
import DetailedCollectionDebugger from '@/components/DetailedCollectionDebugger';
import PayloadDebugger from '@/components/PayloadDebugger';
import TeamCreationTest from '@/components/TeamCreationTest';
import TeamsDebugger from '@/components/TeamsDebugger';
import TeamsListFixed from '@/components/TeamsListFixed';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Teams Setup Debug</h1>
          <p className="text-muted-foreground">
            Debug and verify your Appwrite collections for the teams & chat system
          </p>
        </div>
        
        <TeamCreationTest />
        
        <PayloadDebugger />
        
        <TeamsListFixed />
        
        <TeamsDebugger />
        
        <DetailedCollectionDebugger />
        
        <CollectionDebugger />
      </div>
    </div>
  );
}