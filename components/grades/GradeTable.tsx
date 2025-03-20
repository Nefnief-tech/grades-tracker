// ...existing code...

// Update the GradeTableProps interface to include className
export interface GradeTableProps {
  grades: any; // Keep your existing type or replace with proper type
  subjectId: any; // Keep your existing type or replace with proper type
  onGradeDeleted: () => void;
  className?: string; // Add this line to include className as an optional prop
}

// ...existing code...

// Make sure to use className in your component
export function GradeTable({
  grades,
  subjectId,
  onGradeDeleted,
  className = "",
}: GradeTableProps) {
  // ...existing code...

  return (
    <div className={className}>
      {/* Your existing component JSX */}
      {/* ...existing code... */}
    </div>
  );
}
