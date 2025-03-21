"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  const [hoverCard, setHoverCard] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Add mousePosition state with ref for stability in production
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const isMounted = useRef(false);

  // Track mouse position with smoothing
  useEffect(() => {
    // Mark component as mounted to prevent memory leaks
    isMounted.current = true;

    let rafId: number;
    let targetPos = { x: 0.5, y: 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    // Smooth animation function with lerp (linear interpolation)
    const animate = () => {
      if (!isMounted.current) return;

      // Update ref instantly
      mousePositionRef.current = {
        x:
          mousePositionRef.current.x +
          (targetPos.x - mousePositionRef.current.x) * 0.05,
        y:
          mousePositionRef.current.y +
          (targetPos.y - mousePositionRef.current.y) * 0.05,
      };

      // Update state less frequently
      setMousePosition(mousePositionRef.current);

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      isMounted.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Enable animations after initial render for better page load performance
  useEffect(() => {
    const timer = setTimeout(() => setAnimateItems(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/80 overflow-hidden">
      {/* Ensure CSS variables are defined for production */}
      <style jsx global>{`
        :root {
          --color-primary-rgb: 14, 165, 233;
          --color-foreground-rgb: 0, 0, 0;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-foreground-rgb: 255, 255, 255;
          }
        }
      `}</style>

      {/* Enhanced interactive background elements with true parallax - REMOVED PARTICLES */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl opacity-60"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${
              mousePosition.y * -30
            }px)`,
            transition: "transform 0.5s cubic-bezier(0.21, 0.65, 0.36, 1)",
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-50"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${
              mousePosition.y * 20
            }px)`,
            transition: "transform 0.8s cubic-bezier(0.21, 0.65, 0.36, 1)",
          }}
        ></div>
        <div
          className="absolute top-1/3 left-1/4 w-[40vw] h-[40vw] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl opacity-40"
          style={{
            transform: `translate(${(mousePosition.x - 0.5) * 15}px, ${
              (mousePosition.y - 0.5) * 15
            }px)`,
            transition: "transform 0.6s cubic-bezier(0.21, 0.65, 0.36, 1)",
          }}
        ></div>

        {/* Dynamic light rays effect */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div
            className="absolute h-[200vh] w-[100px] bg-gradient-to-b from-primary/20 to-transparent rotate-45 blur-[50px]"
            style={{
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100 - 100}%`,
              transition: "left 2s ease, top 2s ease",
            }}
          ></div>
        </div>
      </div>

      {/* Navigation with enhanced glow and hover effects */}
      <nav className="container mx-auto py-6 px-4 flex justify-between items-center backdrop-blur-md bg-background/80 sticky top-0 z-40 border-b border-border/40">
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg relative transform group-hover:scale-110 transition-transform rotate-0 group-hover:rotate-[360deg] duration-700">
              <Calculator className="h-6 w-6 text-primary group-hover:text-primary/80" />
            </div>
          </div>
          <span className="font-bold text-xl">GradeTracker</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-medium hover:bg-muted/50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                  <span>Sign Up Free</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section with enhanced parallax and animations */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        {/* Enhanced Diagonal Divider with more responsive animation */}
        <div
          className="absolute bottom-0 left-0 w-full h-32 bg-muted/50 dark:bg-muted/30"
          style={{
            clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0% 100%)",
            transform: `skewY(${(mousePosition.x * 4 - 2).toFixed(2)}deg)`,
            transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 transition-all duration-700 ${
                animateItems
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
              style={{
                transform: `translateY(${mousePosition.y * -10}px)`,
                transition: "transform 0.5s ease-out",
              }}
            >
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium shadow-sm hover:shadow-md hover:bg-primary/20 transition-all cursor-default">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>German Grading Made Simple</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Track Your <span className="text-primary">Grades</span> with
                  Ease
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                The ultimate tool for german students to track, calculate, and
                improve academic performance. Seamlessly manage your 1-6 scale
                grades and visualize your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={user ? "/" : "/register"}>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
                  >
                    <span>
                      {user ? "Go to Dashboard" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4 inline-block group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                {!user && (
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto hover:bg-muted/50 transition-colors shadow-sm"
                    >
                      Login to Your Account
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="feature-badge flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Free Account</span>
                </div>
                <div className="feature-badge flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30 hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Cloud Sync</span>
                </div>
                <div className="feature-badge flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30 hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Visual Analytics</span>
                </div>
              </div>
            </div>

            {/* Enhanced interactive mockup with advanced animations */}
            <div
              className={`relative transition-all duration-1000 ${
                animateItems
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
              onMouseEnter={() => setHoverCard(true)}
              onMouseLeave={() => setHoverCard(false)}
              style={{
                transform: `perspective(1000px) rotateY(${
                  (mousePosition.x - 0.5) * -5
                }deg) rotateX(${(mousePosition.y - 0.5) * 5}deg)`,
                transition: "transform 0.5s ease-out",
              }}
            >
              {/* Animated glow effect */}
              <div
                className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg blur-xl opacity-70"
                style={{
                  transform: `translate(${(mousePosition.x - 0.5) * -20}px, ${
                    (mousePosition.y - 0.5) * -20
                  }px)`,
                  opacity: hoverCard ? 0.9 : 0.7,
                  transition: "transform 0.7s ease-out, opacity 0.5s ease-out",
                }}
              ></div>

              {/* Main card with 3D transformation */}
              <div
                className="bg-card rounded-lg shadow-lg border border-border/50 p-3 relative z-10 transition-all duration-500"
                style={{
                  transform: hoverCard
                    ? `rotate(${
                        (mousePosition.x - 0.5) * -5
                      }deg) scale(1.05) translate(${
                        (mousePosition.x - 0.5) * 15
                      }px, ${(mousePosition.y - 0.5) * 15}px)`
                    : "rotate(0) scale(1)",
                  boxShadow: hoverCard
                    ? `0 20px 30px -10px rgba(0,0,0,0.1), 
                       ${(mousePosition.x - 0.5) * -10}px ${
                        (mousePosition.y - 0.5) * 10
                      }px 30px rgba(var(--color-primary-rgb), 0.1)`
                    : "0 10px 30px -15px rgba(0,0,0,0.1)",
                  transition:
                    "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                }}
              >
                <div className="rounded-md overflow-hidden bg-muted border">
                  <div className="p-4 bg-muted border-b flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2 hover:scale-125 transition-transform"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 hover:scale-125 transition-transform"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:scale-125 transition-transform"></div>
                  </div>
                  <div className="p-8 border-b bg-background">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-8 bg-muted/80 rounded-md w-40 flex items-center px-3 shadow-sm">
                        <BookOpen className="h-4 w-4 text-primary mr-2" />
                        <div className="h-3 bg-primary/20 w-20 rounded"></div>
                      </div>
                      <div className="h-8 bg-primary/10 text-primary rounded-full px-4 flex items-center shadow-sm">
                        <Award className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">1.5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-muted/50 h-24 rounded-md shadow-sm flex flex-col p-3 justify-between border border-border/50"
                        >
                          <div className="h-3 bg-muted w-10 rounded"></div>
                          <div className="h-6 bg-primary/10 text-primary w-full rounded flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {i + 0.5}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-12 bg-muted/40 rounded-md mb-4 flex items-center p-3 shadow-sm border border-border/50">
                      <BarChart2 className="h-5 w-5 text-primary mr-2" />
                      <div className="h-3 bg-muted w-32 rounded"></div>
                    </div>
                    <div className="h-64 bg-muted/30 rounded-md p-4 flex items-center justify-center border border-border/50 shadow-inner relative overflow-hidden">
                      {/* Background grid lines */}
                      <div className="absolute inset-0 bg-grid-chart opacity-30"></div>

                      {/* Gradient background */}
                      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-green-200/40 dark:from-green-500/20 to-transparent"></div>

                      {/* Animated data points */}
                      <div className="absolute inset-0 flex items-end justify-around px-4">
                        {[0.2, 0.6, 0.4, 0.7, 0.3].map((height, i) => (
                          <div
                            key={i}
                            className="relative group"
                            onMouseEnter={() => setActiveFeature(i)}
                            onMouseLeave={() => setActiveFeature(null)}
                          >
                            {/* Animated bar */}
                            <div
                              className={`bar w-8 rounded-t-md transition-all duration-500 ease-out ${
                                hoverCard ? "animate-bar-bounce" : ""
                              }`}
                              style={{
                                height: `${
                                  hoverCard
                                    ? height * 100 +
                                      Math.sin((Date.now() + i * 1000) / 1000) *
                                        5
                                    : height * 100
                                }%`,
                                backgroundColor:
                                  activeFeature === i
                                    ? `rgba(var(--color-primary-rgb), 0.8)`
                                    : `rgba(var(--color-primary-rgb), ${
                                        0.2 + height * 0.3
                                      })`,
                                animationDelay: `${i * 0.1}s`,
                                transform:
                                  activeFeature === i
                                    ? "scaleY(1.1) translateY(-5px)"
                                    : "scaleY(1) translateY(0)",
                                boxShadow:
                                  activeFeature === i
                                    ? "0 10px 15px -3px rgba(var(--color-primary-rgb), 0.3)"
                                    : "none",
                                zIndex: 10,
                              }}
                            ></div>

                            {/* Value popup on hover */}
                            <div
                              className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card px-2 py-1 rounded text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                              style={{
                                backgroundColor:
                                  "rgba(var(--color-primary-rgb), 0.15)",
                                transform: `translate(-50%, ${
                                  activeFeature === i ? "0" : "10px"
                                })`,
                                opacity: activeFeature === i ? 1 : 0,
                              }}
                            >
                              {(7 - height * 6).toFixed(1)}
                            </div>

                            {/* Data point with pulse effect */}
                            <div
                              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
                              style={{
                                opacity: activeFeature === i ? 1 : 0,
                                transform: `translate(-50%, ${
                                  activeFeature === i ? "0" : "10px"
                                })`,
                                boxShadow:
                                  "0 0 0 rgba(var(--color-primary-rgb), 0.4)",
                                animation:
                                  activeFeature === i
                                    ? "pulse 1.5s infinite"
                                    : "none",
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>

                      {/* Animated horizontal guide line that follows mouse Y position */}
                      {hoverCard && (
                        <div
                          className="absolute inset-x-0 h-[1px] bg-primary/30 pointer-events-none transition-all duration-150 opacity-70"
                          style={{
                            top: `${Math.min(
                              Math.max(mousePosition.y * 200, 20),
                              80
                            )}%`,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced background glow */}
              <div
                className="absolute -right-6 -bottom-6 w-60 h-60 bg-primary/5 dark:bg-primary/10 rounded-full -z-10 blur-2xl"
                style={{
                  transform: `translate(${(mousePosition.x - 0.5) * 10}px, ${
                    (mousePosition.y - 0.5) * 10
                  }px)`,
                  opacity: hoverCard ? 0.9 : 0.6,
                  transition: "transform 0.8s ease-out, opacity 0.5s ease",
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with light-mode styles */}
      <section className="py-20 bg-muted/30 dark:bg-muted/30 relative overflow-hidden">
        {/* Dynamic section dividers */}
        <div
          className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={{
            opacity: 0.5 + mousePosition.y * 0.5,
            transform: `scaleX(${0.8 + mousePosition.x * 0.4})`,
            transition: "transform 1s ease, opacity 1s ease",
          }}
        ></div>
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-primary/5 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -30}px, ${
              mousePosition.y * 30
            }px)`,
            transition: "transform 0.8s ease-out",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 shadow-sm">
              Powerful Features
            </div>
            <h2 className="text-3xl font-bold mb-4">Designed for Students</h2>
            <p className="text-muted-foreground">
              Everything you need to keep track of your academic progress with
              the German 1-6 grading system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ultra-enhanced feature cards */}
            <div
              className="feature-card bg-card p-6 rounded-lg border shadow-sm hover:shadow-lg transition-all hover:-translate-y-2 group"
              style={{
                transform: `perspective(1000px) rotateY(${
                  (mousePosition.x - 0.5) * 5
                }deg) rotateX(${(mousePosition.y - 0.5) * -5}deg)`,
                transition:
                  "transform 0.5s ease, box-shadow 0.3s ease, translate 0.3s ease",
              }}
            >
              <div className="relative mb-6 group">
                {/* Icon background with advanced effects */}
                <div className="absolute inset-0 bg-primary/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors transform group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700">
                  <Bookmark className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors relative">
                Course Management
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary/30 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </h3>
              <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Easily organize all your subjects and track grades for each
                course separately.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <PenLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                Grade Recording
              </h3>
              <p className="text-muted-foreground">
                Record grades with type, date, and weighted values for accurate
                average calculations.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                Progress Tracking
              </h3>
              <p className="text-muted-foreground">
                Visualize your academic progress with beautiful charts and
                analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with light-mode compatibility */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/5 dark:bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-blue-500/5 dark:from-primary/5 dark:to-primary/10 border border-primary/20 rounded-lg p-8 md:p-12 text-center relative overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 shadow-sm">
              Start Today
            </span>
            <h2 className="text-3xl font-bold mb-4">
              Ready to Improve Your Grades?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who use GradeTracker to stay on top of
              their academic performance.
            </p>
            <Link href={user ? "/" : "/register"}>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group shadow-lg"
              >
                {user ? "Go to Dashboard" : "Create Free Account"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer with light-friendly styling */}
      <footer className="py-10 border-t border-border/40 bg-background relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">GradeTracker</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} GradeTracker. All rights
              reserved.
              <span className="mx-2">|</span>
              <Link
                href="/privacy-policy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Simplified CSS animations - removed text gradient effects */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @media (prefers-color-scheme: dark) {
          .bg-grid-pattern {
            background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
              );
          }
        }

        /* Card animation */
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Bouncing bar animation */
        @keyframes bar-bounce {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.1);
          }
        }

        .animate-bar-bounce {
          animation: bar-bounce 2s infinite ease-in-out;
        }

        /* Chart grid background */
        .bg-grid-chart {
          background-image: linear-gradient(
              to right,
              rgba(var(--color-foreground-rgb), 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(var(--color-foreground-rgb), 0.05) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
