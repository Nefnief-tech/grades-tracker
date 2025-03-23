import { Subject } from "@/types/grades";

// Simple placeholder components for now
// In a real app, you'd implement these with chart libraries like Recharts

export function BarChart({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Subject Performance</h3>
        <div className="flex flex-col space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center">
              <div className="w-24 mr-3 text-sm text-left truncate">
                {subject.name}
              </div>
              <div className="w-full bg-muted h-8 rounded-md overflow-hidden">
                <div
                  className="bg-primary h-full"
                  style={{
                    // 1 is the best grade, 6 is the worst
                    // Convert to percentage (1=100%, 6=0%)
                    width: `${Math.max(
                      0,
                      Math.min(100, ((6 - subject.averageGrade) / 5) * 100)
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="ml-3 w-10 text-sm font-medium">
                {subject.averageGrade.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LineChart({ subjects }: { subjects: Subject[] }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Grade Trends Over Time</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This is a placeholder for a line chart showing grade trends over time.
          In a real application, this would display grades chronologically.
        </p>
        <div className="h-48 w-full bg-muted/30 rounded-lg border border-border flex items-center justify-center">
          <span className="text-muted-foreground">Line Chart Placeholder</span>
        </div>
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
