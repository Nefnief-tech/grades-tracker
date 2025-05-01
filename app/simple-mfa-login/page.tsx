'use client';

import SimpleMfaLogin from '@/components/SimpleMfaLogin';

export default function SimpleLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <SimpleMfaLogin />
      </div>
    </div>
  );
}