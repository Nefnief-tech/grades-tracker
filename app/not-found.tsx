"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [animateItems, setAnimateItems] = useState(false);

  // Handle mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    setAnimateItems(true);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/80 flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl opacity-60"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${
              mousePosition.y * -30
            }px)`,
            transition: "transform 0.5s cubic-bezier(0.21, 0.65, 0.36, 1)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl opacity-50"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${
              mousePosition.y * 20
            }px)`,
            transition: "transform 0.8s cubic-bezier(0.21, 0.65, 0.36, 1)",
          }}
        ></div>
      </div>

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
        <div
          className={`transition-all duration-700 max-w-2xl ${
            animateItems
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
          style={{
            transform: `perspective(1000px) rotateX(${
              (mousePosition.y - 0.5) * -5
            }deg) rotateY(${(mousePosition.x - 0.5) * 5}deg)`,
            transition:
              "transform 0.5s ease-out, opacity 0.7s ease-out, translate 0.7s ease-out",
          }}
        >
          <div className="text-8xl md:text-9xl font-bold mb-6 text-primary/80">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! It seems like you've navigated to a page that doesn't exist.
            The grade you're looking for might have been moved or deleted.
          </p>

          <div
            className="w-24 h-24 mx-auto mb-8 relative"
            style={{
              transform: `rotate(${(mousePosition.x - 0.5) * 15}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <Search className="w-full h-full text-muted-foreground/30" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="w-full sm:w-auto group"
                style={{
                  transform: `translateY(${(mousePosition.y - 0.5) * -5}px)`,
                  transition: "transform 0.2s ease-out",
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
                <span className="absolute inset-0 bg-white/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
              style={{
                transform: `translateY(${(mousePosition.y - 0.5) * -5}px)`,
                transition: "transform 0.2s ease-out",
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GradeTracker. All rights reserved.
        </div>
      </footer>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
