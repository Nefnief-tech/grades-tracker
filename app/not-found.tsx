"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/80 flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <span className="text-primary">404</span>
          </div>
          <span className="font-semibold text-lg">GradeTracker</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <div className="text-8xl md:text-9xl font-bold mb-6 text-primary/80">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! It seems like you've navigated to a page that doesn't exist.
            The page you're looking for might have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90">
              Go to Dashboard
            </a>
            <button 
              onClick={() => typeof window !== 'undefined' && window.history.back()}
              className="bg-transparent border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-100"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GradeTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
