"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarToggle,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/MainNav";
import { UserNav } from "@/components/UserNav";
import {
  BookOpen,
  Home,
  Settings,
  GraduationCap,
  BarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize the children to prevent unnecessary re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);

  return (
    <SidebarProvider defaultCollapsed={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <SidebarToggle />
            <h2 className="text-lg font-semibold">Grade Tracker</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink href="/" active={pathname === "/"}>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink
                  href="/subjects"
                  active={pathname?.startsWith("/subjects")}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Subjects</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink
                  href="/analysis"
                  active={pathname === "/analysis"}
                >
                  <BarChart className="h-5 w-5" />
                  <span>Analysis</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink
                  href="/settings"
                  active={pathname === "/settings"}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="w-full p-2 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} Grade Tracker</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-14 border-b px-4 sm:px-6 flex items-center">
            <div className="flex items-center justify-between w-full">
              <MainNav />
              <div className="flex items-center gap-4">
                <SyncStatusIndicator />
                <ThemeToggle />
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto w-full">
            {memoizedChildren}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
