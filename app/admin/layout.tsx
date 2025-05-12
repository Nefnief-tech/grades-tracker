'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { LucideShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // If not admin, redirect to admin setup
    if (isClient && user && !isAdmin) {
      router.push('/admin-setup');
    }
    
    // If not logged in, redirect to login
    if (isClient && !user) {
      router.push('/login');
    }
  }, [user, isAdmin, isClient, router]);
  
  // Don't render anything on the server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }
  
  // Show loading state when checking permissions
  if (!user || !isAdmin) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LucideShieldAlert className="h-12 w-12 text-muted-foreground animate-pulse" />
          <h1 className="text-xl font-semibold">Checking admin permissions...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 max-w-7xl">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, settings, and system configuration
        </p>
      </div>
      
      <div className="flex items-center">
        <nav className="flex items-center space-x-4">
          <Button asChild variant="link" className="font-medium">
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button asChild variant="link" className="font-medium">
            <Link href="/admin/users">User Management</Link>
          </Button>
        </nav>
        <div className="ml-auto">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to App</Link>
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {children}
    </div>
  );
}
