import React from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, BarChart, Settings } from "lucide-react";

export function ProductDemo() {
  return (
    <section className="bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Interface Overview
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore the main screens and functionality of Grade Tracker
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-8 rounded-xl border border-border overflow-hidden shadow-2xl">
            <TabsContent value="dashboard" className="mt-0">
              <Image
                src="/screenshots/dashboard.png"
                alt="Dashboard"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background/90 to-transparent p-6">
                <h3 className="text-2xl font-bold mb-2">Dashboard</h3>
                <p className="text-muted-foreground max-w-2xl">
                  The main dashboard provides an overview of all subjects and
                  their average grades. Add new subjects and view recent
                  performance.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Image
                src="/screenshots/analytics.png"
                alt="Analytics"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background/90 to-transparent p-6">
                <h3 className="text-2xl font-bold mb-2">Analytics</h3>
                <p className="text-muted-foreground max-w-2xl">
                  The analytics view shows performance trends over time with
                  interactive charts to help identify patterns.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Image
                src="/screenshots/settings.png"
                alt="Settings"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background/90 to-transparent p-6">
                <h3 className="text-2xl font-bold mb-2">Settings</h3>
                <p className="text-muted-foreground max-w-2xl">
                  Configure app preferences, manage sync options, and control
                  account settings in this section.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
