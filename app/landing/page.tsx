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
  Sparkles,
  ChevronRight,
  Search,
  CheckCircle,
  LayoutGrid,
  Cloud,
  Moon,
  MonitorSmartphone,
  LogIn,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page bg-background">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        {/* Background with gradient and grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 via-background to-background z-0">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1))]" />
        </div>

        {/* Animated blobs */}
        <div className="absolute top-1/3 -left-64 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        {/* Content container */}
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left column - Text content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Track tests, grades, and classes
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Your Academic Journey Visualized
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Designed specifically for the German grading system with
                powerful tools for tracking performance across all your
                subjects.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                {user ? (
                  // User is logged in, show "Go to App" button
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary"
                  >
                    <Link href="/">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  // User is not logged in, show register and login buttons
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary"
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

              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-3 w-3" />
                <span>Explore the features below</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Right column - Preview SVG */}
            <div className="w-full lg:w-1/2">
              <div className="relative transform transition-all hover:scale-102 hover:rotate-1 duration-500">
                <div className="relative rounded-xl overflow-hidden border shadow-2xl p-1 bg-background/80 backdrop-blur-sm">
                  <Image
                    src="/images/dashboard-preview.svg"
                    alt="GradeTracker Dashboard"
                    width={720}
                    height={480}
                    priority
                    className="rounded-lg"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-xs text-muted-foreground mb-2">
            Scroll to explore
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex items-center justify-center">
            <div className="w-1.5 h-3 bg-muted-foreground rounded-full animate-scrollDown"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to visualize and improve your academic
              performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Grade Analytics */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grade Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Interactive charts showing your performance over time with grade
                distribution analysis.
              </p>
            </div>

            {/* Feature 2 - Test Tracking */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Test Tracking</h3>
              <p className="text-muted-foreground mb-4">
                Keep track of upcoming tests and exams with priority levels and
                completion status.
              </p>
            </div>

            {/* Feature 3 - Academic Calendar */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Academic Calendar</h3>
              <p className="text-muted-foreground mb-4">
                Visual calendar with all your academic events in weekly and
                monthly views.
              </p>
            </div>

            {/* Feature 4 - Class Schedule */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Class Schedule</h3>
              <p className="text-muted-foreground mb-4">
                Interactive weekly schedule view with room information and
                custom color coding.
              </p>
            </div>

            {/* Feature 5 - German Grading System */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                German Grading System
              </h3>
              <p className="text-muted-foreground mb-4">
                Built specifically for the German 1-6 grading system with proper
                weighting calculations.
              </p>
            </div>

            {/* Feature 6 - Security & Privacy */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground mb-4">
                Your data is encrypted end-to-end with optional cloud
                synchronization across devices.
              </p>
            </div>

            {/* Feature 7 - Dashboard */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Intuitive Dashboard
              </h3>
              <p className="text-muted-foreground mb-4">
                See all your subjects, grades, upcoming tests, and overall
                performance at a glance.
              </p>
            </div>

            {/* Feature 8 - Cloud Sync */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Cloud Synchronization
              </h3>
              <p className="text-muted-foreground mb-4">
                Access your grades and schedule from any device with secure
                cloud synchronization.
              </p>
            </div>

            {/* Feature 9 - Dark Mode */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Moon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
              <p className="text-muted-foreground mb-4">
                Reduce eye strain with a beautiful dark mode that works across
                the entire application.
              </p>
            </div>

            {/* Feature 10 - Responsive Design */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MonitorSmartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Responsive Design</h3>
              <p className="text-muted-foreground mb-4">
                Enjoy a seamless experience on any device, from desktop to
                mobile.
              </p>
            </div>

            {/* Feature 11 - Subject Management */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Subject Management</h3>
              <p className="text-muted-foreground mb-4">
                Organize your academic life by subjects with custom colors and
                detailed grade histories.
              </p>
            </div>

            {/* Feature 12 - Grade Calculation */}
            <div className="group bg-background rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Weighted Grades</h3>
              <p className="text-muted-foreground mb-4">
                Tests count double with our smart grade calculation, matching
                the German education system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Experience The App
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our intuitive interfaces designed to make academic
              tracking simple
            </p>
          </div>

          {/* Calendar Preview */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="relative transform transition-all hover:scale-105 duration-500 rounded-xl overflow-hidden border shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                <Image
                  src="/images/calendar-preview.svg"
                  alt="Academic Calendar"
                  width={600}
                  height={400}
                  className="rounded-lg relative z-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="max-w-lg mx-auto lg:mx-0">
                <h3 className="text-2xl font-bold mb-4">
                  Visual Academic Calendar
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  See your entire academic schedule at a glance. The calendar
                  integrates classes, tests, and assignment deadlines in one
                  visual interface.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span>Color-coded events for different subjects</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span>Toggle between weekly and monthly views</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span>Quickly add new events with a simple interface</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tests & Exams Preview */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <div className="max-w-lg mx-auto lg:mx-0">
                <h3 className="text-2xl font-bold mb-4">
                  Test & Exam Management
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Keep track of all your upcoming assessments and prioritize
                  your study time effectively.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <span>Mark tests as completed when you're done</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <span>
                      Set high, medium or low priority for better focus
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <span>Filter by subject or time period</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="relative transform transition-all hover:scale-105 duration-500 rounded-xl overflow-hidden border shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                <Image
                  src="/images/tests-preview.svg"
                  alt="Tests and Exams Tracking"
                  width={600}
                  height={400}
                  className="rounded-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10 dark:bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Boost Your Academic Performance?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students who have taken control of their academic
            journey. Start tracking your success today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              // User is logged in, show "Go to Dashboard" button
              <Button
                asChild
                size="lg"
                className="text-base h-12 bg-primary hover:bg-primary/90"
              >
                <Link href="/">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              // User is not logged in, show register and login buttons
              <>
                <Button
                  asChild
                  size="lg"
                  className="text-base h-12 bg-primary hover:bg-primary/90"
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
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">GradeTracker</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GradeTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
