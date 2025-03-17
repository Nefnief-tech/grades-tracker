"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GradeCalculator() {
  const [grades, setGrades] = useState<number[]>([])
  const [currentGrade, setCurrentGrade] = useState<string>("")
  const [error, setError] = useState<string>("")

  const addGrade = () => {
    const grade = Number.parseFloat(currentGrade)
    if (isNaN(grade) || grade < 0 || grade > 100) {
      setError("Please enter a valid grade between 0 and 100")
      return
    }
    setGrades([...grades, grade])
    setCurrentGrade("")
    setError("")
  }

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade, 0)
    return (sum / grades.length).toFixed(2)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Grade Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="number"
              value={currentGrade}
              onChange={(e) => setCurrentGrade(e.target.value)}
              placeholder="Enter grade (0-100)"
              className="flex-grow"
            />
            <Button onClick={addGrade}>Add Grade</Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <h3 className="font-semibold mb-2">Entered Grades:</h3>
            {grades.length > 0 ? (
              <ul className="list-disc list-inside">
                {grades.map((grade, index) => (
                  <li key={index}>{grade}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No grades entered yet</p>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Average Grade:</h3>
            <p className="text-3xl font-bold">{calculateAverage()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

