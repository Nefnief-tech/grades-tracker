"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addNewSubject } from "../utils/storageUtils"
import { PlusCircle } from "lucide-react"

interface SubjectFormProps {
  onSubjectAdded: () => void
}

export function SubjectForm({ onSubjectAdded }: SubjectFormProps) {
  const { user } = useAuth()
  const [subjectName, setSubjectName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddSubject = async () => {
    if (!subjectName.trim()) {
      setError("Subject name cannot be empty")
      return
    }

    setIsLoading(true)

    try {
      // Simulate a slight delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))

      const result = await addNewSubject(subjectName, user?.id, user?.syncEnabled)

      if (result) {
        setSuccess(`Subject "${subjectName}" added successfully`)
        setSubjectName("")
        setError("")
        onSubjectAdded()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError("Failed to add subject. It might already exist.")
      }
    } catch (error) {
      console.error("Error adding subject:", error)
      setError("An error occurred while adding the subject.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <PlusCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Add New Subject
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Create a new subject to track your grades</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2">
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Enter subject name"
            className="flex-grow bg-background border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddSubject()
              }
            }}
          />
          <Button
            onClick={handleAddSubject}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            {isLoading ? "Adding..." : "Add Subject"}
          </Button>
        </div>
        {error && <p className="text-destructive text-xs sm:text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-xs sm:text-sm mt-2">{success}</p>}
      </CardContent>
    </Card>
  )
}

