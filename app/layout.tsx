import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/landing.css"; // Import landing styles
import "../styles/animations.css"; // Import animations
import { Providers } from "@/components/Providers";
import { AppLayout } from "@/components/AppLayout";
import { CookieBanner } from "@/components/CookieBanner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { PLAUSIBLE_URL, PLAUSIBLE_DOMAIN } from "@/config/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "German Grade Tracker",
  description:
    "Track and calculate your grades using the German grading system",
  icons: {
    icon: [
      { url: "/grade-tracker-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/grade-tracker-logo.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* Plausible Analytics */}
        <Script
          src={`${PLAUSIBLE_URL}/js/script.js`}
          data-domain={PLAUSIBLE_DOMAIN}
          defer
        />
        <Script id="plausible-events-api" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { 
              (window.plausible.q = window.plausible.q || []).push(arguments) 
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Providers>
              <AnalyticsProvider>
                <AppLayout>{children}</AppLayout>
                <CookieBanner />
              </AnalyticsProvider>
            </Providers>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
