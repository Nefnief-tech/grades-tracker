"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, BookOpen } from "lucide-react";
import Link from "next/link";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user } = useAuth();

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur-[1px] flex items-center px-4 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="mr-2"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link href="/" className="flex items-center">
        <div className="bg-primary/10 p-1 rounded-md mr-2">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold">GradeTracker</span>
      </Link>

      {user && (
        <div className="ml-auto">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </header>
  );
}
