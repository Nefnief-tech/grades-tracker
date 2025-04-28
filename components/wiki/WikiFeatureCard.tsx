"use client";

import React from "react";
import { motion } from "framer-motion";

interface WikiFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function WikiFeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: WikiFeatureCardProps) {
  return (
    <motion.div
      className="border rounded-lg p-3 sm:p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-base font-semibold">{title}</h4>
          <p className="text-xs sm:text-sm mt-1 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}