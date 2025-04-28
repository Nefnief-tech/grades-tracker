"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WikiHeroProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  badges?: React.ReactNode;
  gradient?: "default" | "secondary" | "accent";
}

export function WikiHero({
  title,
  description,
  icon,
  children,
  className,
  badges,
  gradient = "default",
}: WikiHeroProps) {
  const getGradientStyle = () => {
    switch (gradient) {
      case "secondary":
        return "from-secondary/20 via-background to-primary/10";
      case "accent":
        return "from-accent/20 via-background to-primary/10";
      case "default":
      default:
        return "from-primary/20 via-background to-secondary/20";
    }
  };

  return (
    <motion.div
      className={cn(
        "mb-8 md:mb-12 rounded-2xl bg-gradient-to-br p-6 md:p-8 border shadow-sm",
        getGradientStyle(),
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {icon && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-primary/10 p-3 md:p-4 rounded-full flex items-center justify-center"
          >
            {icon}
          </motion.div>
        )}

        <div>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>

      {badges && (
        <motion.div
          className="mt-6 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {badges}
        </motion.div>
      )}

      {children && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}