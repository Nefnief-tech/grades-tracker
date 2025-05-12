'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// This is a quick hack page to force admin status
export default function ForceAdminPage() {
  const router = useRouter();
  
  const setAdminCookie = () => {
    try {
      // Set admin cookie directly
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days
      
      document.cookie = `admin-status=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      alert('Admin cookie set! You should now have admin access.');
      router.push('/admin');
    } catch (error) {
      console.error('Error setting admin cookie:', error);
      alert('Error setting admin cookie: ' + error);
    }
  };
  
  // Auto-set cookie on page load
  useEffect(() => {
    setAdminCookie();
  }, []);
  
  return (
    <div className="container py-16 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin Access</h1>
      <p className="text-center max-w-md">
        This page forces admin access by directly setting the admin-status cookie.
        You should be automatically redirected to the admin panel.
      </p>
      
      <div className="flex gap-4 mt-4">
        <Button onClick={setAdminCookie}>
          Set Admin Cookie
        </Button>
        
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Go to Admin Panel
        </Button>
      </div>
    </div>
  );
}