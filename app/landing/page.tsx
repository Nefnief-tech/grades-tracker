"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bookmark,
  PenLine,
  TrendingUp,
  CheckCircle,
  Calculator,
  Sparkles,
  BarChart2,
  Award,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [animateItems, setAnimateItems] = useState(false);

  // Simple mouse position state without any smoothing to start
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Basic animation trigger
  useEffect(() => {
    setAnimateItems(true);

    // Basic mouse move listener
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/80">
      {/* Removed the debug mouse position display */}

      {/* Simple moving background element */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "60vw",
            height: "60vw",
            background: "rgba(14, 165, 233, 0.1)",
            borderRadius: "100%",
            filter: "blur(30px)",
            transform: `translate(${mousePosition.x * 50 - 25}px, ${
              mousePosition.y * 50 - 25
            }px)`,
            transition: "transform 0.5s ease-out",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="container mx-auto py-6 px-4 flex justify-between items-center backdrop-blur-sm bg-background/80 sticky top-0 z-40 border-b border-border/40">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">GradeTracker</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up Free</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Basic hero section that animates to confirm effects work */}
      <section className="pt-16 pb-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-700 ${
                animateItems
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Track Your Grades with Ease
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                The ultimate tool for German students to track, calculate, and
                improve academic performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={user ? "/" : "/register"}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto group relative"
                    style={{
                      transform: `translateX(${mousePosition.x * 10 - 5}px)`,
                      transition: "transform 0.2s ease-out",
                    }}
                  >
                    {user ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Simple animated card */}
            <div
              className={`bg-card border rounded-lg shadow-md p-6 transition-all duration-1000 ${
                animateItems
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
              style={{
                transform: `rotate(${(mousePosition.x - 0.5) * -3}deg)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              <h3 className="text-lg font-semibold mb-4">Grades Dashboard</h3>
              <div className="h-40 bg-muted/30 rounded-md flex justify-around items-end p-4">
                {[0.3, 0.6, 0.4, 0.8, 0.5].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${height * 100}%`,
                      width: "10%",
                      backgroundColor: "var(--color-primary)",
                      opacity: 0.6,
                      borderRadius: "4px 4px 0 0",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Very basic footer */}
      <footer className="py-10 border-t">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} GradeTracker. All rights reserved.</p>
        </div>
      </footer>

      {/* Basic animations test */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
