import Link from "next/link"
import { cn } from "@/lib/utils"
import { Palette, Settings } from "lucide-react"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        href="/grades"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Grades
      </Link>
      <Link
        href="/subjects"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Subjects
      </Link>
      <Link
        href="/analytics"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Analytics
      </Link>
      <Link
        href="/profile/themes"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
      >
        <Palette className="mr-1 h-4 w-4" /> Themes
      </Link>
      <Link
        href="/profile/settings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
      >
        <Settings className="mr-1 h-4 w-4" /> Settings
      </Link>
    </nav>
  )
}