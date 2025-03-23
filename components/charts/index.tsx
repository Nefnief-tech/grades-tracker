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
  const [gradeCounts, setGradeCounts] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });

  // Additional analysis metrics
  const [totalGrades, setTotalGrades] = useState(0);
  const [bestSubject, setBestSubject] = useState<{
    name: string;
    avg: number;
  } | null>(null);
  const [worstSubject, setWorstSubject] = useState<{
    name: string;
    avg: number;
  } | null>(null);
  const [averageGrade, setAverageGrade] = useState<number | null>(null);

  useEffect(() => {
    // Calculate additional metrics
    if (subjects.length === 0) return;

    let total = 0;
    let weightedSum = 0;
    let best = { name: "", avg: 6 };
    let worst = { name: "", avg: 1 };

    // Reset grade counts
    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    subjects.forEach((subject) => {
      if (subject.grades && subject.grades.length > 0) {
        // Count grades by rounded value for pie chart
        subject.grades.forEach((grade) => {
          const roundedGrade = Math.round(grade.value);
          if (roundedGrade >= 1 && roundedGrade <= 6) {
            counts[roundedGrade as keyof typeof counts]++;
          }

          // Add to weighted sum for average calculation
          weightedSum += grade.value * (grade.weight || 1);
          total += grade.weight || 1;
        });

        // Check for best and worst subjects
        if (subject.averageGrade < best.avg && subject.averageGrade > 0) {
          best = { name: subject.name, avg: subject.averageGrade };
        }
        if (subject.averageGrade > worst.avg) {
          worst = { name: subject.name, avg: subject.averageGrade };
        }
      }
    });

    // Update state with calculated values
    setGradeCounts(counts);
    setTotalGrades(total);
    setBestSubject(best.name ? best : null);
    setWorstSubject(worst.name ? worst : null);
    setAverageGrade(
      total > 0 ? Number((weightedSum / total).toFixed(2)) : null
    );
  }, [subjects]);

  // Colors for each grade with enhanced styling
  const gradeColors = {
    1: {
      bg: "bg-green-500",
      fill: "fill-green-500",
      text: "text-green-700 dark:text-green-400",
    },
    2: {
      bg: "bg-blue-500",
      fill: "fill-blue-500",
      text: "text-blue-700 dark:text-blue-400",
    },
    3: {
      bg: "bg-yellow-500",
      fill: "fill-yellow-500",
      text: "text-yellow-700 dark:text-yellow-400",
    },
    4: {
      bg: "bg-orange-500",
      fill: "fill-orange-500",
      text: "text-orange-700 dark:text-orange-400",
    },
    5: {
      bg: "bg-red-500",
      fill: "fill-red-500",
      text: "text-red-700 dark:text-red-400",
    },
    6: {
      bg: "bg-red-700",
      fill: "fill-red-700",
      text: "text-red-800 dark:text-red-300",
    },
  };

  // Calculate total for percentages
  const totalGradeCount = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  // If no grades, show a message
  if (totalGradeCount === 0) {
    // Debug message to help troubleshoot
    console.log("PieChart: No grades found", {
      subjects: subjects.length,
      gradesInSubjects: subjects.map((s) => s.grades?.length || 0),
      gradeCounts,
      totalGradeCount,
    });

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Grades Available</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add grades to see your grade distribution.
          </p>
        </div>
      </div>
    );
  }

  // Calculate segments for pie chart
  const segments = [];
  let cumulativePercentage = 0;

  for (const [grade, count] of Object.entries(gradeCounts)) {
    if (count > 0) {
      const percentage = (count / totalGradeCount) * 100;
      const startPercentage = cumulativePercentage;
      cumulativePercentage += percentage;

      segments.push({
        grade: Number(grade),
        count,
        percentage,
        startPercentage,
        endPercentage: cumulativePercentage,
        color: gradeColors[Number(grade) as keyof typeof gradeColors].bg,
        borderColor:
          gradeColors[Number(grade) as keyof typeof gradeColors].border,
        textColor: gradeColors[Number(grade) as keyof typeof gradeColors].text,
      });
    }
  }

  // Create SVG path for pie chart segments
  const generateSegmentPath = (
    startPercentage: number,
    endPercentage: number,
    radius: number
  ) => {
    const startAngle = (startPercentage / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (endPercentage / 100) * 2 * Math.PI - Math.PI / 2;

    const startX = radius + radius * Math.cos(startAngle);
    const startY = radius + radius * Math.sin(startAngle);
    const endX = radius + radius * Math.cos(endAngle);
    const endY = radius + radius * Math.sin(endAngle);

    const largeArcFlag = endPercentage - startPercentage > 50 ? 1 : 0;

    return `M ${radius} ${radius} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8">
      <div className="flex flex-col items-center">
        {/* Actual SVG Pie Chart - with direct color fill values */}
        <div className="relative w-56 h-56 mb-2">
          <svg
            width="224"
            height="224"
            viewBox="0 0 100 100"
            className="transform -rotate-90"
          >
            {segments.map((segment) => (
              <path
                key={segment.grade}
                d={generateSegmentPath(
                  segment.startPercentage,
                  segment.endPercentage,
                  50
                )}
                className={`hover:opacity-90 transition-all duration-200`}
                stroke="hsl(var(--background))"
                strokeWidth="0.5"
                fill={getColorForGrade(segment.grade)}
              >
                <title>
                  Grade {segment.grade}: {segment.count} grades (
                  {segment.percentage.toFixed(1)}%)
                </title>
              </path>
            ))}
            {/* Center circle for better aesthetics */}
            <circle cx="50" cy="50" r="25" className="fill-card" />
          </svg>
          {/* Display total grades in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{totalGradeCount}</span>
            <span className="text-sm text-muted-foreground">Grades</span>
          </div>
        </div>

        {/* Analysis summary */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-xs">
          {averageGrade !== null && (
            <div className="bg-card border rounded-md p-3 text-center">
              <div className="text-xl font-bold">{averageGrade}</div>
              <div className="text-xs text-muted-foreground">
                Overall Average
              </div>
            </div>
          )}

          {bestSubject && (
            <div className="bg-card border rounded-md p-3 text-center">
              <div
                className="text-sm font-medium truncate"
                title={bestSubject.name}
              >
                {bestSubject.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <span className="text-emerald-500">★</span> Best Subject (
                {bestSubject.avg.toFixed(1)})
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-3">Grade Distribution</h3>

        {/* Legend with progress bars */}
        {segments.map((segment) => (
          <div key={segment.grade} className="flex items-center mb-2">
            <div className={`w-5 h-5 rounded-sm mr-2 ${segment.color}`}></div>
            <div className="min-w-24">
              <span className={`text-sm font-medium ${segment.textColor}`}>
                Grade {segment.grade}:
              </span>
            </div>
            <div className="flex-1 mx-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${segment.color} h-2 rounded-full`}
                  style={{ width: `${segment.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-1 min-w-24">
              <span className="text-sm">{segment.count}</span>
              <span className="text-xs text-muted-foreground">
                ({segment.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}

        {/* Insights */}
        <div className="mt-6 p-4 bg-card border rounded-md">
          <h4 className="font-medium mb-2">Insights</h4>
          <ul className="text-sm space-y-2">
            {segments.length > 0 && (
              <li>
                Most common grade:{" "}
                <span className="font-medium">
                  {segments
                    .sort((a, b) => b.count - a.count)[0]
                    .grade.toFixed(1)}
                </span>
              </li>
            )}
            {bestSubject && worstSubject && (
              <li>
                Grade range:{" "}
                <span className="font-medium">
                  {bestSubject.avg.toFixed(1)} - {worstSubject.avg.toFixed(1)}
                </span>
              </li>
            )}
            {(segments
              .filter((s) => s.grade <= 4)
              .reduce((sum, s) => sum + s.count, 0) /
              totalGradeCount) *
              100 >=
              60 && (
              <li className="text-green-600 dark:text-green-400">
                More than 60% of your grades are passing grades (≤ 4.0)
              </li>
            )}
            {(segments
              .filter((s) => s.grade <= 2)
              .reduce((sum, s) => sum + s.count, 0) /
              totalGradeCount) *
              100 >=
              30 && (
              <li className="text-emerald-600 dark:text-emerald-400">
                Strong performance with 30%+ excellent grades (≤ 2.0)
              </li>
            )}
            {(segments
              .filter((s) => s.grade >= 5)
              .reduce((sum, s) => sum + s.count, 0) /
              totalGradeCount) *
              100 >=
              20 && (
              <li className="text-red-600 dark:text-red-400">
                Warning: 20%+ of your grades need improvement (≥ 5.0)
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  // Helper function to get color for grade
  function getColorForGrade(grade: number): string {
    switch (grade) {
      case 1:
        return "#10b981"; // green-500
      case 2:
        return "#3b82f6"; // blue-500
      case 3:
        return "#eab308"; // yellow-500
      case 4:
        return "#f97316"; // orange-500
      case 5:
        return "#ef4444"; // red-500
      case 6:
        return "#b91c1c"; // red-700
      default:
        return "#6b7280"; // gray-500
    }
  }
}
