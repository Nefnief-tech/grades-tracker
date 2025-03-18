import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative bg-primary/10 rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]"></div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to take control of your academic journey?
          </h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join thousands of students who are using Grade Tracker to monitor
            their progress and improve their performance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              "Free to use for basic features",
              "No credit card required",
              "Works on all devices",
              "Secure and private",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
