"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "@/components/ui/toaster";
import { SWRConfigProvider } from "@/lib/swr-config";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfigProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SettingsProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </SWRConfigProvider>
  );
}
