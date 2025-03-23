"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  BarChart2,
  Settings,
  User,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  BookOpenText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { getSubjectsFromStorage } from "@/utils/storageUtils";
import type { Subject } from "@/types/grades";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const savedSubjects = await getSubjectsFromStorage(
          user?.id,
          user?.syncEnabled
        );
        setSubjects(Array.isArray(savedSubjects) ? savedSubjects : []);
      } catch (error) {
        console.error("Error loading subjects:", error);
        setSubjects([]);
      }
    };

    loadSubjects();

    // Listen for subject changes
    const handleSubjectsUpdated = () => {
      loadSubjects();
    };

    window.addEventListener("subjectsUpdated", handleSubjectsUpdated);

    return () => {
      window.removeEventListener("subjectsUpdated", handleSubjectsUpdated);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      current: pathname === "/analytics",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: pathname === "/profile",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname === "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-md">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          {!isCollapsed && <span className="font-semibold">GradeTracker</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {/* Main Navigation */}
          {navigationItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "justify-center px-0" : ""
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          ))}

          {/* Subjects Section - Improved styling */}
          {!isCollapsed && subjects.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center px-2 mb-3">
                <BookOpenText className="h-4 w-4 text-muted-foreground mr-2" />
                <h3 className="text-xs font-medium text-muted-foreground">
                  SUBJECTS
                </h3>
                <Badge className="ml-auto text-xs" variant="outline">
                  {subjects.length}
                </Badge>
              </div>
              <Separator className="mb-2" />

              <div className="space-y-0.5 pr-1">
                {subjects.map((subject) => (
                  <Link key={subject.id} href={`/subjects/${subject.id}`}>
                    <div
                      className={cn(
                        "group flex items-center rounded-md px-2 py-1.5 text-sm",
                        pathname === `/subjects/${subject.id}`
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted transition-colors"
                      )}
                    >
                      <GraduationCap
                        className={cn(
                          "h-4 w-4 mr-2 flex-shrink-0",
                          pathname === `/subjects/${subject.id}`
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground transition-colors"
                        )}
                      />
                      <span className="truncate flex-1">{subject.name}</span>
                      {subject.averageGrade > 0 && (
                        <span
                          className={cn(
                            "ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium",
                            subject.averageGrade <= 2.0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : subject.averageGrade <= 3.0
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : subject.averageGrade <= 4.0
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {subject.averageGrade.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Collapsed view for subjects */}
          {isCollapsed && subjects.length > 0 && (
            <div className="mt-6 flex flex-col items-center">
              <Badge variant="outline" className="mb-2">
                {subjects.length}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/">
                  <BookOpenText className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </ScrollArea>

      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="space-y-1 text-sm leading-none">
                <p className="font-medium">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email || ""}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      )}
    </div>
  );
}
