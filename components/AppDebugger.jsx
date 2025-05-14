'use client';

import { useEffect } from 'react';
import { initializeDebugHelpers } from '@/utils/debugHelper';

/**
 * Component that adds debug utilities to the app
 */
export default function AppDebugger() {
  useEffect(() => {
    // Initialize debug helpers
    initializeDebugHelpers();
    
    // Add the decoder function for encrypted grades
    if (typeof window !== 'undefined' && !window.decodeGrade) {
      window.decodeGrade = function(encryptedValue) {
        try {
          // This is a placeholder - in a real app, you'd add the actual decoding logic
          return "Decoder initialized. Use this in console to decode encrypted grades.";
        } catch (e) {
          return "Failed to decode: " + e.message;
        }
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}