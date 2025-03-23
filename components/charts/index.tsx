import { Subject, Grade } from "@/types/grades";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function BarChart({ subjects }: { subjects: Subject[] }) {
  // Sort subjects by performance (best to worst)
  const sortedSubjects = [...subjects].sort(
    (a, b) => a.averageGrade - b.averageGrade
  );

  // Get grade color based on value
  const getGradeColor = (grade: number) => {
    if (grade <= 1.5) return "bg-green-500 dark:bg-green-600";
    if (grade <= 2.5) return "bg-blue-500 dark:bg-blue-600";
    if (grade <= 3.5) return "bg-yellow-500 dark:bg-yellow-600";
    if (grade <= 4.5) return "bg-orange-500 dark:bg-orange-600";
    return "bg-red-500 dark:bg-red-600";
  };

  // Text color for grade labels
  const getTextColor = (grade: number) => {
    if (grade <= 1.5) return "text-green-700 dark:text-green-400";
    if (grade <= 2.5) return "text-blue-700 dark:text-blue-400";
    if (grade <= 3.5) return "text-yellow-700 dark:text-yellow-400";
    if (grade <= 4.5) return "text-orange-700 dark:text-orange-400";
    return "text-red-700 dark:text-red-400";
  };

  if (subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No subjects to display</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-2">
      <div className="space-y-6 py-2">
        <div className="grid grid-cols-[1fr,2fr,auto] gap-4 items-center text-sm text-muted-foreground mb-2">
          <div>Subject</div>
          <div>Performance</div>
          <div>Grade</div>
        </div>

        {sortedSubjects.map((subject) => (
          <div
            key={subject.id}
            className="grid grid-cols-[1fr,2fr,auto] gap-4 items-center group"
          >
            <div className="font-medium truncate" title={subject.name}>
              {subject.name}
            </div>
            <div className="relative w-full h-10">
              {/* Background bar */}
              <div className="absolute inset-0 bg-muted rounded-lg overflow-hidden"></div>

              {/* Foreground bar with animation */}
              <div
                className={`absolute inset-y-0 left-0 ${getGradeColor(
                  subject.averageGrade
                )} rounded-lg transition-all duration-500`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, ((6 - subject.averageGrade) / 5) * 100)
                  )}%`,
                }}
              ></div>

              {/* Number of grades indicator */}
              <div className="absolute inset-0 flex items-center justify-end pr-4 text-xs">
                <span className="bg-background/80 px-2 py-0.5 rounded-full">
                  {subject.grades?.length || 0} grades
                </span>
              </div>
            </div>

            <div
              className={`font-bold text-lg ${getTextColor(
                subject.averageGrade
              )}`}
            >
              {subject.averageGrade.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full mr-1"></div>
          <span className="text-xs">1.0-1.5</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full mr-1"></div>
          <span className="text-xs">1.6-2.5</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-600 rounded-full mr-1"></div>
          <span className="text-xs">2.6-3.5</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 dark:bg-orange-600 rounded-full mr-1"></div>
          <span className="text-xs">3.6-4.5</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded-full mr-1"></div>
          <span className="text-xs">4.6-6.0</span>
        </div>
      </div>
    </div>
  );
}

export function LineChart({ subjects }: { subjects: Subject[] }) {
  const [allGrades, setAllGrades] = useState<
    Array<{
      date: Date;
      value: number;
      subjectName: string;
      id: string;
      subjectId: string;
    }>
  >([]);

  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  // Extract and prepare grades for visualization
  useEffect(() => {
    const grades: Array<{
      date: Date;
      value: number;
      subjectName: string;
      id: string;
      subjectId: string;
    }> = [];

    subjects.forEach((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        subject.grades.forEach((grade) => {
          try {
            const gradeDate = new Date(grade.date);
            if (!isNaN(gradeDate.getTime())) {
              grades.push({
                date: gradeDate,
                value: grade.value,
                subjectName: subject.name,
                id: grade.id,
                subjectId: subject.id,
              });
            }
          } catch (e) {
            console.error("Invalid date format:", grade.date);
          }
        });
      }
    });

    // Sort chronologically
    grades.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAllGrades(grades);
  }, [subjects]);

  // If we don't have any valid grades, show a message
  if (allGrades.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            No Grade History Available
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add grades to subjects to see your grade trends over time.
          </p>
        </div>
      </div>
    );
  }

  // Function to get dot color based on grade value
  const getDotColor = (value: number) => {
    if (value <= 1.5) return "bg-green-500";
    if (value <= 2.5) return "bg-blue-500";
    if (value <= 3.5) return "bg-yellow-500";
    if (value <= 4.5) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="h-full relative px-2 py-4">
      {/* Y-axis labels (grade scale) */}
      <div className="absolute left-0 top-10 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground">
        <div>1.0</div>
        <div>2.0</div>
        <div>3.0</div>
        <div>4.0</div>
        <div>5.0</div>
        <div>6.0</div>
      </div>

      {/* Chart area */}
      <div className="ml-12 relative border-l border-b border-border h-[300px]">
        {/* Background grid lines */}
        {[1, 2, 3, 4, 5, 6].map((grade) => (
          <div
            key={grade}
            className="absolute left-0 right-0 border-t border-dashed border-border/30"
            style={{ top: `${((grade - 1) / 5) * 100}%` }}
          ></div>
        ))}

        {/* Plot dots for each grade */}
        {allGrades.map((grade, index) => {
          // Calculate position - Y position based on grade value (1-6 scale)
          const yPercent = ((grade.value - 1) / 5) * 100; // 1=0%, 6=100%
          const xPercent = (index / (allGrades.length - 1 || 1)) * 100;

          return (
            <div
              key={grade.id}
              className={cn(
                "absolute w-3 h-3 rounded-full transition-all duration-200 cursor-pointer -translate-x-1.5 -translate-y-1.5",
                getDotColor(grade.value),
                activeGrade === grade.id
                  ? "scale-150 ring-2 ring-background ring-offset-1"
                  : "hover:scale-125"
              )}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
              }}
              onMouseEnter={() => setActiveGrade(grade.id)}
              onMouseLeave={() => setActiveGrade(null)}
            >
              {/* Tooltip */}
              <div
                className={cn(
                  "absolute z-10 bottom-full left-1/2 -translate-x-1/2 -translate-y-2 bg-card shadow-md rounded-md p-2 text-xs w-max max-w-48 opacity-0 pointer-events-none",
                  "border transition-opacity duration-200",
                  activeGrade === grade.id ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="font-bold mb-1">{grade.subjectName}</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="font-medium">{grade.value}</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>{grade.date.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Connect dots with lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
          <polyline
            points={allGrades
              .map((grade, index) => {
                const x = (index / (allGrades.length - 1 || 1)) * 100 + "%";
                const y = ((grade.value - 1) / 5) * 100 + "%";
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(var(--primary), 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* X-axis labels (dates) */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-6 flex justify-between text-xs text-muted-foreground">
          {allGrades.length > 0 && (
            <>
              <div>{allGrades[0].date.toLocaleDateString()}</div>
              {allGrades.length > 2 && (
                <div>
                  {allGrades[
                    Math.floor(allGrades.length / 2)
                  ].date.toLocaleDateString()}
                </div>
              )}
              <div>
                {allGrades[allGrades.length - 1].date.toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Grade trend over time across all subjects</p>
        <p className="mt-1 text-xs">
          Lower numbers (1.0) are better grades in the German system
        </p>
      </div>
    </div>
  );
}

export function PieChart({ subjects }: { subjects: Subject[] }) {
  // Count grades by their rounded values
  const gradeCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  subjects.forEach((subject) => {
    if (subject.grades && subject.grades.length > 0) {
      subject.grades.forEach((grade) => {
        // Round to nearest integer
        const roundedGrade = Math.round(grade.value);
        if (roundedGrade >= 1 && roundedGrade <= 6) {
          gradeCounts[roundedGrade as keyof typeof gradeCounts]++;
        }
      });
    }
  });

  // Colors for each grade
  const gradeColors = {
    1: "bg-green-500",
    2: "bg-emerald-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
    5: "bg-red-500",
    6: "bg-red-700",
  };

  const total = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
        <div className="w-48 h-48 rounded-full border-8 border-muted relative">
          {/* Simplified pie chart representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{total} Grades</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(gradeCounts).map(([grade, count]) => (
          <div key={grade} className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                gradeColors[Number(grade) as keyof typeof gradeColors]
              }`}
            ></div>
            <span className="text-sm font-medium mr-2">Grade {grade}:</span>
            <span className="text-sm">{count} grades</span>
            <span className="text-xs text-muted-foreground ml-2">
              ({total > 0 ? ((count / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
