import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

// ...existing code...

export function SidebarNavItems() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        // ...existing code...
      })}

      {/* Flashcards Link */}
      <li>
        <Link
          href="/flashcards"
          className={cn(
            "flex items-center py-1.5 px-2.5 rounded-md text-sm font-medium",
            pathname.includes("/flashcards")
              ? "text-primary-foreground bg-primary hover:bg-primary/80"
              : "text-accent-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <path d="M18 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
            <path d="M14 17H2" />
            <path d="M14 11H2" />
            <path d="M14 5H2" />
            <path d="m22 15-4 4-4-4" />
            <path d="M18 13v6" />
          </svg>
          Flashcards
        </Link>
      </li>
    </>
  );
}

// ...existing code...