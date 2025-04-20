"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { deleteSubject, debugSubjects } from "@/utils/storageUtils"; // Assuming these exist
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming Button is used
import { Skeleton } from "@/components/ui/skeleton"; // Assuming Skeleton is used

// SUPER SIMPLE COMPONENT - MAXIMUM RELIABILITY
export default function SubjectPage() {
  // This page likely shouldn't exist, the dynamic route [id]/page.tsx handles individual subjects.
  // For now, let's just return a simple message or redirect.
  const router = useRouter();
  useEffect(() => {
    router.push("/"); // Redirect to dashboard
  }, [router]);

  return (
    <div className="container py-8">
      <p>Loading subject...</p>
      {/* Or render a loading state */}
      <SubjectSkeleton />
    </div>
  );
}

function SubjectSkeleton() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="mb-6">
        <Skeleton className="h-6 w-32 rounded" />
      </div>
      <div className="mb-8">
        <Skeleton className="h-8 w-1/2 mb-2 rounded" />
        <Skeleton className="h-6 w-1/4 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg lg:col-span-2" />
      </div>
    </div>
  );
}

// Add this empty export to ensure the file is treated as a module
export {};
