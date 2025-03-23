import React from "react";
import Link from "next/link";
import { Calculator, Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:h-16">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-md">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} GradeTracker. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Shield className="h-3 w-3" />
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
