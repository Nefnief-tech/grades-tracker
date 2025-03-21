"use client";

import React, { useEffect, useState } from "react";

// Define CSS variables for colors that might be missing
const cssVariables = {
  "--color-primary-rgb": "14, 165, 233", // sky-500 color in RGB
  "--color-foreground-rgb": "0, 0, 0",
};

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Track mouse position with smoothing
  useEffect(() => {
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
      setMousePosition((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.05,
        y: prev.y + (targetPos.y - prev.y) * 0.05,
      }));

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Generate particles with random positions and properties
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 2,
    color:
      i % 3 === 0
        ? "rgba(var(--color-primary-rgb), 0.2)"
        : i % 3 === 1
        ? "rgba(59, 130, 246, 0.15)" // blue
        : "rgba(168, 85, 247, 0.15)", // purple
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <>
      {/* CSS variables */}
      <style jsx global>{`
        :root {
          ${Object.entries(cssVariables)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n")}
        }
      `}</style>

      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Main blobs */}
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

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute rounded-full animate-float"
            style={{
              top: particle.top,
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              transform: `translateY(${
                (mousePosition.y - 0.5) * 20
              }px) translateX(${(mousePosition.x - 0.5) * 20}px)`,
              transition: "transform 1s ease-out",
            }}
          ></div>
        ))}

        {/* Light ray */}
        <div
          className="absolute h-[200vh] w-[100px] bg-gradient-to-b from-primary/20 to-transparent rotate-45 blur-[50px]"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100 - 100}%`,
            transition: "left 2s ease, top 2s ease",
            opacity: 0.3,
          }}
        ></div>
      </div>

      {/* Animations CSS */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            opacity: 0;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25%,
          75% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) translateX(30px) rotate(15deg);
          }
        }

        .animate-float {
          opacity: 0;
          animation-name: float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          filter: blur(1px);
        }
      `}</style>
    </>
  );
}
