'use client';

import React from 'react';
import StandaloneDebugGrades from '@/components/StandaloneDebugGrades';
import Link from 'next/link';

export default function DebugGradesPage() {
  return (
    <div className="container mx-auto p-4">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-blue-500 hover:text-blue-700">Home</Link>
        {' > Debug > Grades'}
      </nav>
      
      <h1 className="text-2xl font-bold mb-6">Grades Debug Page</h1>
      <p className="mb-6 text-gray-600">
        This page helps diagnose issues with subject grades in the application.
        It shows the raw data fetched from Appwrite and how it's being processed.
      </p>
        <div className="border rounded-lg overflow-hidden shadow-sm">
        <StandaloneDebugGrades />
      </div>
    </div>
  );
}