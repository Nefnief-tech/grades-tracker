'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MFALoginPage } from '@/components/MFALoginPage';

export default function LoginWithMFAPage() {
  const { updateUserState } = useAuth();
  
  // Simple handler that updates the auth context with the user
  const handleLoginSuccess = (user: any) => {
    updateUserState(user);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <MFALoginPage 
          onLoginSuccess={handleLoginSuccess}
          redirectPath="/dashboard"
        />
      </div>
    </div>
  );
}