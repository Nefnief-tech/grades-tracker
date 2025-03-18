import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { OverviewSection } from "@/components/landing/OverviewSection";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/grade-tracker-logo.svg"
            alt="Grade Tracker"
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-2xl font-bold text-primary">Grade Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/">
            <Button>Go to App</Button>
          </Link>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeatureShowcase />
        <ProductDemo />
        <TestimonialSection />
        <OverviewSection />
      </main>

      <footer className="bg-muted/30 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-4">
            © {new Date().getFullYear()} Grade Tracker. Educational project.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/about"
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link href="/help" className="hover:text-primary transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
