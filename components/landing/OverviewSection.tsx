import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function OverviewSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative bg-primary/10 rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            About Grade Tracker
          </h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Grade Tracker was developed as an educational project to provide
            students with a simple tool for tracking academic performance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              "Open source project",
              "Designed for the German grading system",
              "Works offline by default",
              "Privacy-focused design",
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Using Grade Tracker
              </Button>
            </Link>
            <Link href="https://github.com/Nefnief-tech/grades-tracker.git">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
