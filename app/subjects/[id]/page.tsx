"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CalendarIcon,
  BarChart,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeForm } from "@/components/GradeForm";
import { GradeList } from "@/components/GradeList";
import { GradeHistoryChart } from "@/components/GradeHistoryChart";
import { getSubjectById } from "@/utils/storageUtils";
import type { Subject } from "@/types/grades";

export default function SubjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartStyle, setChartStyle] = useState<"line" | "bar">("line");
  const [showGradeForm, setShowGradeForm] = useState(false);

  useEffect(() => {
    async function loadSubject() {
      if (typeof id !== "string") return;

      try {
        const subjectData = await getSubjectById(
          id,
          user?.id,
          user?.syncEnabled
        );
        setSubject(subjectData);
      } catch (error) {
        console.error("Failed to load subject:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [id, user]);

  function getGradeColor(grade: number): string {
    if (grade <= 1.5) return "bg-green-500";
    if (grade <= 2.5) return "bg-yellow-500";
    if (grade <= 3.5) return "bg-orange-500";
    return "bg-red-500";
  }

  if (loading) {
    return (
      <SidebarInset className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-screen flex items-center justify-center">
            <p>Loading subject...</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (!subject) {
    return (
      <SidebarInset className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-screen flex flex-col items-center justify-center">
            <p className="text-lg text-muted-foreground mb-4">
              Subject not found
            </p>
            <Button onClick={() => router.push("/")}>Back to Dashboard</Button>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset className="w-full">
      <div className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {subject.name}
              </h1>
              <p className="text-muted-foreground">
                {subject.grades.length}{" "}
                {subject.grades.length === 1 ? "grade" : "grades"} recorded
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - Stats and Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Average grade card */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Grade Overview</CardTitle>
                  <CardDescription>
                    Your performance in this subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <div className="text-muted-foreground text-sm mb-1">
                        Current Average
                      </div>
                      <div
                        className={`text-3xl font-bold px-3 py-1 rounded-md ${
                          subject.averageGrade
                            ? getGradeColor(subject.averageGrade) +
                              " text-white"
                            : ""
                        }`}
                      >
                        {subject.averageGrade?.toFixed(2) || "N/A"}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <div className="text-muted-foreground text-sm mb-1">
                        Best Grade
                      </div>
                      <div className="text-3xl font-bold">
                        {subject.grades.length > 0
                          ? Math.min(
                              ...subject.grades.map((g) => g.value)
                            ).toFixed(1)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg flex flex-col items-center">
                      <div className="text-muted-foreground text-sm mb-1">
                        Latest Grade
                      </div>
                      <div className="text-3xl font-bold">
                        {subject.grades.length > 0
                          ? subject.grades[
                              subject.grades.length - 1
                            ].value.toFixed(1)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced chart section */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Grade History</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={chartStyle === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartStyle("line")}
                      >
                        <LineChartIcon className="h-4 w-4 mr-1" />
                        Line
                      </Button>
                      <Button
                        variant={chartStyle === "bar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartStyle("bar")}
                      >
                        <BarChart className="h-4 w-4 mr-1" />
                        Bar
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Your grade progression over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <GradeHistoryChart
                      grades={subject.grades}
                      height={350}
                      showGrid={true}
                      chartType={chartStyle}
                      showAxis={true}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Grade List and Add Grade Form */}
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader className="pb-2 flex flex-row justify-between items-center">
                  <CardTitle className="text-xl">Grades</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowGradeForm(!showGradeForm)}
                  >
                    {showGradeForm ? "Cancel" : "Add Grade"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {showGradeForm && (
                    <div className="mb-6">
                      <GradeForm
                        subjectId={subject.id}
                        onSuccess={() => {
                          setShowGradeForm(false);
                          // Reload subject data after adding a grade
                          getSubjectById(
                            subject.id,
                            user?.id,
                            user?.syncEnabled
                          ).then((updatedSubject) => {
                            if (updatedSubject) setSubject(updatedSubject);
                          });
                        }}
                      />
                    </div>
                  )}

                  <GradeList
                    subjectId={subject.id}
                    grades={subject.grades}
                    onGradeDeleted={() => {
                      // Reload subject data after deleting a grade
                      getSubjectById(
                        subject.id,
                        user?.id,
                        user?.syncEnabled
                      ).then((updatedSubject) => {
                        if (updatedSubject) setSubject(updatedSubject);
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
