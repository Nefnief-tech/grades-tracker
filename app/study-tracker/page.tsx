"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This is a temporary placeholder to fix the build
export default function StudyTrackerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to study-timer for now
    router.push("/study-timer");
  }, [router]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Study Tracker</h1>
      <p className="text-muted-foreground mt-2">
        Redirecting to the Study Timer page...
      </p>
    </div>
  );
}
