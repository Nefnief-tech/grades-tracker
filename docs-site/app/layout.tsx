import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: {
    template: "%s | Grade Tracker Docs",
    default: "Grade Tracker Documentation",
  },
  description:
    "Official documentation for Grade Tracker — a modern grade management application for students.",
};
