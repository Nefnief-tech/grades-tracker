// Quick fix for analytics - better error handling
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';

export function useAnalyticsDebug() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!user) {
      setStatus('no-user');
      console.log('[Analytics Debug] No user logged in');
      return;
    }

    if (!user.$id) {
      setStatus('no-user-id');
      console.log('[Analytics Debug] User object exists but no $id:', user);
      return;
    }

    setStatus('user-ready');
    console.log('[Analytics Debug] User ready for analytics:', {
      userId: user.$id,
      userEmail: user.email,
      userName: user.name
    });

  }, [user]);

  return { status, user };
}

// Temporary analytics functions with better error handling
export const createSafeUserSession = async (userId: string) => {
  console.log('[Analytics Debug] Attempting to create session for:', userId);
  
  if (!userId) {
    console.error('[Analytics Debug] Cannot create session: userId is required');
    return null;
  }

  // Return mock session for now
  const mockSession = {
    $id: 'debug-session-' + Date.now(),
    userId,
    sessionId: 'debug-session-' + Date.now(),
    startTime: new Date().toISOString()
  };

  console.log('[Analytics Debug] Mock session created:', mockSession);
  return mockSession;
};