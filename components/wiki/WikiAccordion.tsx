"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WikiAccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function WikiAccordionItem({
  title,
  children,
  icon,
  defaultOpen = false,
  className,
}: WikiAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        className={cn(
          "flex items-center justify-between w-full text-left px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors",
          isOpen && "bg-muted/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-muted-foreground">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface WikiAccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function WikiAccordion({ children, className }: WikiAccordionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}