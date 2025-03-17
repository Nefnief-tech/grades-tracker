"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import type { Subject } from "../types/grades"
import { getSubjectsFromStorage } from "../utils/storageUtils"
import { ThemeToggle } from "./ThemeToggle"
import { BookOpen, GraduationCap, Home } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const savedSubjects = await getSubjectsFromStorage()
        setSubjects(Array.isArray(savedSubjects) ? savedSubjects : [])
      } catch (error) {
        console.error("Error loading subjects:", error)
        setSubjects([])
      }
    }

    loadSubjects()

    // Add event listener for storage changes
    const handleStorageChange = () => {
      loadSubjects()
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for subject changes
    window.addEventListener("subjectsUpdated", loadSubjects)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("subjectsUpdated", loadSubjects)
    }
  }, [])

  return (
    <ShadcnSidebar className="border-r border-border bg-background">
      <SidebarHeader className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <h2 className="text-base md:text-lg font-semibold">Grade Calculator</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link href="/" className="flex items-center gap-2 text-sm md:text-base">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="px-2 md:px-3 py-2">
            <h3 className="mb-2 px-3 md:px-4 text-xs font-semibold text-muted-foreground">Subjects</h3>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {subjects.map((subject) => (
                <SidebarMenuItem key={subject.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/subjects/${subject.id}`}>
                    <Link href={`/subjects/${subject.id}`} className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4" />
                      {subject.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          </div>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3 md:p-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">© 2023 Grade Calculator</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}

