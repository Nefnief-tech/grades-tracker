"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Simple placeholder component that redirects to the main dashboard
export default function SubjectsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main dashboard where subjects are managed
    router.push("/");
  }, [router]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Subjects</h1>
      <p className="text-muted-foreground mt-2">
        Redirecting to the dashboard where you can manage your subjects...
      </p>
    </div>
  );
}
