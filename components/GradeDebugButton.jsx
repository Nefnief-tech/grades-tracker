'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * A small debug button component that can be added to any page
 */
export default function GradeDebugButton() {
  const pathname = usePathname();
  const [showDebug, setShowDebug] = useState(false);
  
  // Don't show on the debug page itself
  if (pathname.includes('/debug')) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showDebug && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2 w-64">
          <h3 className="font-semibold mb-2">Debug Tools</h3>
          <div className="flex flex-col gap-2">
            <Link 
              href="/debug/grades" 
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              View Subject Grades
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('gradeCalculator');
                alert('Local cache cleared');
                window.location.reload();
              }}
              className="px-3 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
            >
              Clear Grade Cache
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="rounded-full w-12 h-12 bg-gray-800 text-white flex items-center justify-center shadow-lg"
      >
        {showDebug ? '×' : '⚒️'}
      </button>
    </div>
  );
}