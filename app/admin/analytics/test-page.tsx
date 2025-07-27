'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Hardcoded admin user ID
const ADMIN_USER_ID = '67d6f7fe0019adf0fd95';

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple check without auth context dependency
  useEffect(() => {
    // Try to get user from localStorage or session
    const checkAuth = async () => {
      try {
        // Simulate getting current user - replace with your actual auth method
        const currentUser = {
          $id: '67d6f7fe0019adf0fd95', // Your admin ID for testing
          name: 'Admin User',
          email: 'admin@example.com'
        };
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Failed to check authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check if user is admin using hardcoded user ID
  const isAdmin = user?.$id === ADMIN_USER_ID;

  // Show loading if still checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if auth check failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Authentication Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show login required
  if (!user || !user.$id) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-4">Please log in to access the analytics dashboard.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-2">You don't have admin access to this page.</p>
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-300 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-500">Your User ID: <code className="bg-gray-700 px-1 rounded">{user.$id}</code></p>
            <p className="text-xs text-gray-500">Required Admin ID: <code className="bg-gray-700 px-1 rounded">{ADMIN_USER_ID}</code></p>
            <p className="text-xs text-gray-500">Match: {user.$id === ADMIN_USER_ID ? '✅ Yes' : '❌ No'}</p>
          </div>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Admin access granted - show analytics dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-blue-400">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Admin: {user.name || user.email}
              </div>
              <Link href="/dashboard" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-900/50 border border-green-600 text-green-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">🎉 Admin Access Granted!</h3>
          <p className="text-sm">You have successfully accessed the admin analytics dashboard.</p>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Users</h3>
            <p className="text-2xl font-bold text-blue-400">0</p>
            <p className="text-xs text-gray-500 mt-1">Database not yet connected</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Active Sessions</h3>
            <p className="text-2xl font-bold text-green-400">0</p>
            <p className="text-xs text-gray-500 mt-1">Database not yet connected</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Page Views</h3>
            <p className="text-2xl font-bold text-purple-400">0</p>
            <p className="text-xs text-gray-500 mt-1">Database not yet connected</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Errors</h3>
            <p className="text-2xl font-bold text-red-400">0</p>
            <p className="text-xs text-gray-500 mt-1">Database not yet connected</p>
          </div>
        </div>

        {/* Analytics Placeholder */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Analytics Overview</h3>
          <div className="text-center py-12 text-gray-400">
            <p className="mb-2">📊 Analytics charts will be displayed here</p>
            <p className="text-sm">Once the analytics database is properly set up and connected</p>
          </div>
        </div>

        {/* Debug and Next Steps */}
        <div className="bg-blue-900/50 border border-blue-600 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-200">🔧 Next Steps</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <span>Admin access is working correctly</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400">🔄</span>
              <span>Complete the analytics database setup using the manual guide</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-400">📝</span>
              <span>Test the debug page at <Link href="/debug-analytics" className="underline text-blue-300">/debug-analytics</Link></span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-400">🔗</span>
              <span>Connect the analytics service to show real data</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Current Session Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            <div>
              <span className="text-gray-500">User ID:</span><br />
              <code className="text-blue-400">{user.$id}</code>
            </div>
            <div>
              <span className="text-gray-500">Name:</span><br />
              <span className="text-gray-300">{user.name || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span><br />
              <span className="text-gray-300">{user.email || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}