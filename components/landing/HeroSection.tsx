import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">
            German Grade System (1-6)
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Track Your <span className="text-primary">Academic Progress</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
          A simple, intuitive tool for students to record, visualize, and
          analyze their grades throughout the academic year.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="gap-2 group">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn About Features
            </Button>
          </Link>
        </div>
        <div className="pt-6 text-sm text-muted-foreground">
          <p>
            Designed for German education system • Open source project •
            Prioritizes your privacy
          </p>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="relative z-10 rounded-xl shadow-2xl shadow-primary/20 border border-border overflow-hidden">
          <Image
            src="/screenshots/dashboard-hero.png"
            alt="Grade Tracker Dashboard"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
        <div className="absolute -top-10 right-10 w-24 h-24 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
