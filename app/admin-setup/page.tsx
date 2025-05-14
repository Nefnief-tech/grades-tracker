'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSetupPage() {
  const [adminCode, setAdminCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, updateUserState } = useAuth();

  // Pre-fill email if user is logged in
  useState(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  });
  const setupAdmin = async () => {
    setLoading(true);
    
    try {
      // Set admin cookie directly for immediate effect
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days
      
      document.cookie = `admin-status=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      // Use our direct admin setup API in the background
      fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email || user?.email,
          code: adminCode
        })
      }).catch(err => {
        console.log('Background admin setup error (non-critical):', err);
      });
      
      // Update user state with admin rights
      if (updateUserState) {
        updateUserState({ isAdmin: true });
      }
      
      toast({
        title: "Admin Rights Granted",
        description: "You now have administrator privileges.",
      });
      
      // Redirect to admin page after a short delay
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
      
    } catch (error: any) {
      console.error('Error setting up admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to set up admin privileges."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <CardDescription>
            Enter the admin code to gain administrator privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email || user?.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2"
                disabled={!!user?.email}
              />
              <Input
                id="adminCode"
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Default admin code is: admin123
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={setupAdmin}
            disabled={loading || !adminCode || !(email || user?.email)}
          >
            {loading ? "Setting up..." : "Activate Admin Rights"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}