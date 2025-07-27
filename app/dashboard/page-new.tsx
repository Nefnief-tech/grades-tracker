'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Welcome</CardTitle>
            <User className="h-4 w-4 ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.name || 'User'}</div>
            <p className="text-xs text-muted-foreground">
              Logged in successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{user?.email}</div>
            <p className="text-xs text-muted-foreground">
              {user?.emailVerification ? 'Verified' : 'Pending verification'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              Protected Account
            </div>
            <p className="text-xs text-muted-foreground">
              <button 
                onClick={() => router.push('/settings')}
                className="text-primary hover:underline cursor-pointer"
              >
                Manage 2FA settings
              </button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access your teams and collaboration tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => router.push('/teams')}
            >
              <User className="h-4 w-4 mr-2" />
              My Teams
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/settings')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}