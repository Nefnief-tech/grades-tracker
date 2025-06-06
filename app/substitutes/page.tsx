import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SubstitutesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Substitute Plan</h1>
        <Button variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Today's Changes</CardTitle>
            <Badge>Update Available</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <h3 className="font-semibold mb-2">Substitute Plan Coming Soon</h3>
            <p className="text-muted-foreground">
              Your class substitution plan will be displayed here. Check back later for updates.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      <h2 className="text-2xl font-bold mb-4">Tomorrow's Plan</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              The substitute plan for tomorrow will appear here when available.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Last updated: Not yet synchronized</p>
      </div>
    </div>
  );
}