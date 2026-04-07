"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  BarChart2,
  GraduationCap,
  Calendar,
  ClipboardList,
  Clock,
  Shield,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Cloud,
  Moon,
  TrendingUp,
  Award,
  Users,
  Zap,
} from "lucide-react";

/* ── German grade color map ── */
const gradeColors = [
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-400",
  "bg-red-600",
];

const gradeLabels = [
  "Sehr gut",
  "Gut",
  "Befriedigend",
  "Ausreichend",
  "Mangelhaft",
  "Ungenügend",
];

/* ── Grade color bar ── */
function GradeColorBar() {
  return (
    <div className="flex gap-1.5 max-w-xs">
      {gradeColors.map((color, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${color} opacity-80`}
        />
      ))}
    </div>
  );
}

/* ── Stat item ── */
function StatItem({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Improved scroll reveal animation with better performance
  useEffect(() => {
    const handleScroll = () => {
      // More aggressive reveal distance - reveal content sooner
      const elements = document.querySelectorAll(".reveal-on-scroll");
      const windowHeight = window.innerHeight;

      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const top = rect.top;
          // Reveal at 95% of window height instead of 85%
          if (top < windowHeight * 0.95) {
            element.classList.add("revealed");
          }
        });
      });
    };

    // Use passive event listener for better scrolling performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Immediately reveal elements in the viewport on first load
    setTimeout(() => {
      handleScroll();
    }, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add a class to ensure page content is always visible
  useEffect(() => {
    // Add always-visible class to the entire content after a short delay
    // This ensures content is visible even if animations don't trigger properly
    const timer = setTimeout(() => {
      const contentElement = document.querySelector(".landing-page");
      contentElement?.classList.add("always-visible");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page bg-background relative overflow-hidden">
      {/* Subtle background with accent shapes */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background"></div>
        {/* Floating accent shapes */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-primary"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div
          className="absolute top-1/2 -left-48 w-80 h-80 rounded-full blur-3xl opacity-15 bg-cyan-500"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 bg-emerald-500"
          style={{ transform: `translateY(${scrollY * 0.03}px)` }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="hero-section relative overflow-hidden min-h-screen flex items-center">
          <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left column - Text content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary mb-8 reveal-on-scroll">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium tracking-wide">
                    Track tests, grades, and classes
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground reveal-on-scroll">
                  Your Academic Journey{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                      Visualized
                    </span>
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 rounded-full opacity-40" />
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed reveal-on-scroll animation-delay-200">
                  Designed specifically for the German grading system with
                  powerful tools for tracking performance across all your
                  subjects.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 reveal-on-scroll animation-delay-300">
                  {user ? (
                    <Button
                      asChild
                      size="lg"
                    >
                      <Link href="/">
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        size="lg"
                      >
                        <Link href="/register">
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Grade color bar + labels */}
                <div className="reveal-on-scroll animation-delay-400">
                  <GradeColorBar />
                  <div className="flex gap-1.5 max-w-xs mt-2">
                    {gradeLabels.map((label) => (
                      <span
                        key={label}
                        className="text-[0.55rem] text-muted-foreground/60 flex-1 text-center truncate"
                      >
                        {label.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column - Preview SVG with colored glow */}
              <div className="w-full lg:w-1/2 reveal-on-scroll animation-delay-300">
                <div className="relative">
                  {/* Colored glow behind image */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-emerald-500/20 rounded-2xl blur-2xl" />
                  <div className="relative transform transition-all duration-500">
                    <div className="relative rounded-xl overflow-hidden border shadow-xl ring-1 ring-border/50">
                      <Image
                        src="/images/dashboard-preview.svg"
                        alt="GradeTracker Dashboard"
                        width={720}
                        height={480}
                        priority
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center">
            <div className="text-center animate-bounce">
              <span className="block text-sm text-muted-foreground mb-2">
                Scroll to explore
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 mx-auto flex items-center justify-center">
                <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-scrollDown"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to visualize and improve your academic
                performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 - Grade Analytics */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BarChart2 className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Grade Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interactive charts showing your performance over time with
                  grade distribution analysis.
                </p>
              </div>

              {/* Feature 2 - Test Tracking */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-amber-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Test Tracking</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Keep track of upcoming tests and exams with priority levels
                  and completion status.
                </p>
              </div>

              {/* Feature 3 - Academic Calendar */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Academic Calendar
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Visual calendar with all your academic events in weekly and
                  monthly views.
                </p>
              </div>

              {/* Feature 4 - Class Schedule */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-violet-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Clock className="h-5 w-5 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Class Schedule</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interactive weekly schedule view with room information and
                  custom color coding.
                </p>
              </div>

              {/* Feature 5 - German Grading System */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-rose-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-rose-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-5 w-5 text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  German Grading System
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Built specifically for the German 1-6 grading system with
                  proper weighting calculations.
                </p>
              </div>

              {/* Feature 6 - Security & Privacy */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-teal-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Shield className="h-5 w-5 text-teal-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your data is encrypted end-to-end with optional cloud
                  synchronization across devices.
                </p>
              </div>

              {/* Feature 7 - Dashboard */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-sky-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <LayoutGrid className="h-5 w-5 text-sky-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Intuitive Dashboard
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  See all your subjects, grades, upcoming tests, and overall
                  performance at a glance.
                </p>
              </div>

              {/* Feature 8 - Cloud Sync */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-indigo-500/30 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Cloud className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Cloud Synchronization
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access your grades and schedule from any device with secure
                  cloud synchronization.
                </p>
              </div>

              {/* Feature 9 - Dark Mode */}
              <div className="group feature-card bg-card rounded-lg p-6 border border-border transition-all duration-300 hover:shadow-md hover:border-slate-500/50 hover:-translate-y-0.5 revealed opacity-100">
                <div className="h-10 w-10 rounded-md bg-slate-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Moon className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dark Mode</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Reduce eye strain with a beautiful dark mode that works across
                  the entire application.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Band */}
        <section className="py-16 border-y border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-3 reveal-on-scroll">
                <div className="text-blue-500"><TrendingUp className="h-5 w-5" /></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">1–6</div>
                  <div className="text-xs text-muted-foreground">German grade scale</div>
                </div>
              </div>
              <div className="flex items-center gap-3 reveal-on-scroll">
                <div className="text-emerald-500"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">∞</div>
                  <div className="text-xs text-muted-foreground">Subjects tracked</div>
                </div>
              </div>
              <div className="flex items-center gap-3 reveal-on-scroll">
                <div className="text-indigo-500"><Cloud className="h-5 w-5" /></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs text-muted-foreground">Cloud access</div>
                </div>
              </div>
              <div className="flex items-center gap-3 reveal-on-scroll">
                <div className="text-amber-500"><Award className="h-5 w-5" /></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">AES</div>
                  <div className="text-xs text-muted-foreground">End-to-end encrypted</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Showcase Section */}
        <section
          id="showcase"
          className="py-24 section-wrapper revealed"
        >
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center reveal-on-scroll revealed">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Experience The App
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our intuitive interfaces designed to make academic
                tracking simple
              </p>
            </div>

            {/* Calendar Preview */}
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-24 reveal-on-scroll revealed">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -inset-3 bg-emerald-500/10 rounded-xl blur-xl" />
                  <div className="relative transform transition-all duration-500 rounded-lg overflow-hidden border shadow-lg">
                    <Image
                      src="/images/calendar-preview.svg"
                      alt="Academic Calendar"
                      width={600}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="max-w-lg mx-auto lg:mx-0">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Visual Academic Calendar
                  </h3>
                  <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                    See your entire academic schedule at a glance. The calendar
                    integrates classes, tests, and assignment deadlines in one
                    visual interface.
                  </p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <div className="bg-emerald-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-sm">Color-coded events for different subjects</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-emerald-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-sm">Toggle between weekly and monthly views</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-emerald-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-sm">
                        Quickly add new events with a simple interface
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tests & Exams Preview */}
            <div className="flex flex-col lg:flex-row items-center gap-12 reveal-on-scroll revealed">
              <div className="w-full lg:w-1/2">
                <div className="max-w-lg mx-auto lg:mx-0">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Test & Exam Management
                  </h3>
                  <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                    Keep track of all your upcoming assessments and prioritize
                    your study time effectively.
                  </p>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <div className="bg-amber-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="text-sm">Set priority levels for better focus</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-amber-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="text-sm">Mark tests as completed when you're done</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-amber-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="text-sm">
                        Set high, medium or low priority for better focus
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-amber-500/10 p-1.5 rounded-md mr-3 mt-0.5">
                        <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="text-sm">Filter by subject or time period</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-3 bg-amber-500/10 rounded-xl blur-xl" />
                  <div className="relative transform transition-all duration-500 rounded-lg overflow-hidden border shadow-lg">
                    <Image
                      src="/images/tests-preview.svg"
                      alt="Tests and Exams Tracking"
                      width={600}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="get-started"
          className="py-24 section-wrapper revealed"
        >
          <div className="container mx-auto px-4">
            <div className="relative rounded-xl overflow-hidden p-8 md:p-12 lg:p-16 border border-border reveal-on-scroll revealed">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-cyan-500/5" />
              {/* Decorative corner accents */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 max-w-3xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                  Ready to Boost Your Academic Performance?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                  Join thousands of students who have taken control of their
                  academic journey. Start tracking your success today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <Button
                      asChild
                      size="lg"
                      className="text-base h-12"
                    >
                      <Link href="/">
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="text-base h-12"
                      >
                        <Link href="/register">Create Free Account</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="text-base h-12"
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t section-wrapper revealed">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <BookOpen className="h-5 w-5 text-primary mr-2" />
                <span className="font-semibold">GradeTracker</span>
              </div>
              <div className="flex gap-8 mb-4 md:mb-0">
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} GradeTracker. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
