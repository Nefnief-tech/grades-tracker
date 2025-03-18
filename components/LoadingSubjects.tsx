export function LoadingSubjects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-muted/40 border border-border/50 rounded-lg p-6 h-48 flex flex-col justify-between"
        >
          <div>
            <div className="h-6 bg-muted/70 rounded w-3/5 mb-3"></div>
            <div className="h-3 bg-muted/70 rounded w-1/4 mb-1"></div>
            <div className="h-3 bg-muted/70 rounded w-3/4"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted/70 rounded w-12"></div>
            <div className="h-8 bg-muted/70 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
