import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Target, Trophy, AlertCircle, Save } from "lucide-react";

interface GradeGoalsProps {
  subjects: any[];
}

export function GradeGoals({ subjects }: GradeGoalsProps) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState<Record<string, number>>({});

  // Load saved goals on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("gradeGoals");
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error("Error loading grade goals:", e);
      }
    }
  }, []);

  // Start editing - copy current goals to temp state
  const handleStartEdit = () => {
    setTempGoals({ ...goals });
    setIsEditing(true);
  };

  // Save goals
  const handleSaveGoals = () => {
    setGoals(tempGoals);
    localStorage.setItem("gradeGoals", JSON.stringify(tempGoals));
    setIsEditing(false);

    toast({
      title: "Goals saved",
      description: "Your grade goals have been updated.",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setTempGoals({});
    setIsEditing(false);
  };

  // Update a specific goal
  const updateGoal = (subjectId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1.0 && numValue <= 6.0) {
      setTempGoals((prev) => ({ ...prev, [subjectId]: numValue }));
    }
  };

  // Calculate progress toward goal
  const calculateProgress = (subject) => {
    if (!goals[subject.id]) return 100; // No goal set

    // In German system lower is better, so invert calculation
    const startValue = 6.0; // Worst possible grade
    const goalGap = startValue - goals[subject.id]; // Distance to goal
    const currentGap = startValue - subject.averageGrade; // Current distance from worst

    // Calculate progress percentage
    let progress = (currentGap / goalGap) * 100;

    // Cap between 0 and 100
    progress = Math.min(100, Math.max(0, progress));

    return progress;
  };

  // Handle empty state
  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          Add subjects to set grade goals.
        </p>
      </div>
    );
  }

  // Get subjects with grades only
  const subjectsWithGrades = subjects.filter(
    (subj) => subj.grades && subj.grades.length > 0
  );

  if (subjectsWithGrades.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          Add grades to your subjects to set goals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isEditing ? (
        // View mode
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium text-lg">Your Grade Goals</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress toward target grades
              </p>
            </div>
            <Button size="sm" onClick={handleStartEdit}>
              Edit Goals
            </Button>
          </div>

          <div className="space-y-4">
            {subjectsWithGrades.map((subject) => {
              const hasGoal = goals[subject.id] !== undefined;
              const progress = calculateProgress(subject);
              const reachedGoal =
                hasGoal && subject.averageGrade <= goals[subject.id];

              return (
                <Card
                  key={subject.id}
                  className={`${
                    reachedGoal ? "border-green-200 dark:border-green-800" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {subject.name}
                      </CardTitle>
                      {reachedGoal && (
                        <Trophy className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <CardDescription>
                      {hasGoal ? (
                        <span>
                          Current: {subject.averageGrade.toFixed(2)} / Goal:{" "}
                          {goals[subject.id].toFixed(2)}
                        </span>
                      ) : (
                        <span>Current: {subject.averageGrade.toFixed(2)}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasGoal ? (
                      <>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-right mt-1 text-muted-foreground">
                          {reachedGoal
                            ? "Goal reached!"
                            : `${progress.toFixed(0)}% toward goal`}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No goal set for this subject
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        // Edit mode
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium text-lg">Edit Grade Goals</h3>
              <p className="text-sm text-muted-foreground">
                Set target grades for each subject (1.0-6.0)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {subjectsWithGrades.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3">
                <Label htmlFor={`goal-${subject.id}`} className="w-1/3">
                  {subject.name}
                </Label>
                <div className="w-2/3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-10">
                    Now: {subject.averageGrade.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <Target className="h-4 w-4 text-primary" />
                    <Input
                      id={`goal-${subject.id}`}
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="6.0"
                      defaultValue={goals[subject.id]?.toFixed(1) || ""}
                      placeholder="Goal"
                      className="max-w-[80px]"
                      onChange={(e) => updateGoal(subject.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoals}>
              <Save className="h-4 w-4 mr-2" /> Save Goals
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
