"use client"; // Add this to make it a client component

import Link from "next/link";
import { Calculator, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  // Client-side function to navigate back
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/80 flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
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
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>

            <button
              onClick={handleGoBack}
              className="bg-muted px-4 py-2 rounded-md hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-border/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GradeTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
