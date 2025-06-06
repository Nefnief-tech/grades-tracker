import React from 'react';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b flex h-14 items-center px-6 bg-primary">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}