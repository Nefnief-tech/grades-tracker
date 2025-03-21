"use client";

import React from "react";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`text-gradient inline-block ${className}`}>
      {children}
      <style jsx>{`
        .text-gradient {
          background: linear-gradient(
            to right,
            var(--color-primary, #0ea5e9),
            #6366f1
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% 100%;
          animation: subtle-shift 8s ease-in-out infinite alternate;
        }

        @keyframes subtle-shift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </span>
  );
}

export function ShineText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`fancy-text inline-block ${className}`}>
      {children}
      <style jsx>{`
        .fancy-text {
          background-size: 300% auto;
          background-image: linear-gradient(
            to right,
            var(--color-primary, #0ea5e9) 0%,
            #6366f1 30%,
            var(--color-primary, #0ea5e9) 60%,
            #6366f1 100%
          );
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 6s linear infinite;
        }

        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </span>
  );
}
