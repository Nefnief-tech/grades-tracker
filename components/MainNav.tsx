"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 items-center">
      <Link
        href="/"
        className={cn(
          "text-lg font-semibold flex items-center",
          pathname === "/" ? "text-primary" : "text-foreground"
        )}
      >
        Grade Calculator
      </Link>
    </div>
  );
}
