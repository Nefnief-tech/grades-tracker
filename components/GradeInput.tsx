"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Grade, GradeType } from "../types/grades"
import { PlusCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GradeInputProps {
  onAddGrade: (grade: Grade) => void
}

// Define weight for each grade type
const GRADE_WEIGHTS: Record<GradeType, number> = {
  Test: 2.0, // Tests count double
  "Oral Exam": 1.0,
  Homework: 1.0,
  Project: 1.0,
}

export function GradeInput({ onAddGrade }: GradeInputProps) {
  const [grade, setGrade] = useState("")
  const [type, setType] = useState<GradeType>("Test")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddGrade = async () => {
    const gradeValue = Number.parseInt(grade)
    if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 6) {
      setError("Please enter a valid grade between 1 and 6")
      return
    }

    setIsLoading(true)

    // Simulate a slight delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newGrade: Grade = {
      value: gradeValue,
      type,
      date: new Date().toISOString().split("T")[0],
      weight: GRADE_WEIGHTS[type], // Assign weight based on type
    }

    console.log("Adding grade:", newGrade)
    onAddGrade(newGrade)
    setGrade("")
    setError("")
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Enter grade (1-6)"
          className="flex-grow bg-background border-border"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddGrade()
            }
          }}
        />
        <div className="relative flex-grow-0 w-full sm:w-auto">
          <Select value={type} onValueChange={(value: GradeType) => setType(value)}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder="Select grade type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Test">Test (Weight: 2.0)</SelectItem>
              <SelectItem value="Oral Exam">Oral Exam (Weight: 1.0)</SelectItem>
              <SelectItem value="Homework">Homework (Weight: 1.0)</SelectItem>
              <SelectItem value="Project">Project (Weight: 1.0)</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-10 top-0 h-full">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Tests count double in your average grade calculation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          onClick={handleAddGrade}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          {isLoading ? "Adding..." : "Add Grade"}
        </Button>
      </div>
      {error && <p className="text-destructive text-xs sm:text-sm">{error}</p>}
    </div>
  )
}

