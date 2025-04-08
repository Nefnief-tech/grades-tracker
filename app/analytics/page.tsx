"use client";

import { useState, useEffect } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  TrendingUp,
  PieChart,
  BarChart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Import Dialog components that were missing
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Import the Cell component from recharts
import { Cell } from "recharts";

// Import dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import chart components
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { AverageGradeChart } from "@/components/charts/AverageGradeChart";
import { GradeTrendChart } from "@/components/charts/GradeTrendChart";
import { SubjectComparisonChart } from "@/components/charts/SubjectComparisonChart";

// Import new components
import { PerformanceInsights } from "@/components/analytics/PerformanceInsights";
import { GradeGoals } from "@/components/analytics/GradeGoals";
import { MobileNavigation } from "@/components/analytics/MobileNavigation";
import {
  Download,
  Lightbulb,
  Target,
  Sparkles,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

// Add this import at the top with other imports
import {
  exportToPDF,
  createAnalyticsPrintableElement,
} from "@/utils/pdfExport";

// Custom Book icon component
function BookIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

// Custom Clipboard icon component
function ClipboardIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

// Overview card component
function OverviewCard({ title, value, icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-xl sm:text-2xl font-bold mt-2">{value}</div>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trend display component
function TrendDisplay({ subjects, getGradeColorClass, compact = false }) {
  // Calculate trend based on all grades across all subjects
  const allGrades = subjects
    .flatMap((subject) => subject.grades || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allGrades.length < 2) {
    return <span className="text-muted-foreground">Not enough data</span>;
  }

  // Calculate trend between most recent grade and the one before
  const trend = allGrades[0].value - allGrades[1].value;
  const arrow = trend < 0 ? "↓" : trend > 0 ? "↑" : "→";

  return (
    <div className={`flex items-center ${compact ? "text-sm" : ""}`}>
      <span className={getGradeColorClass(allGrades[0].value)}>
        {allGrades[0].value.toFixed(1)}
      </span>
      <span
        className={`ml-1 ${
          trend < 0
            ? "text-green-500"
            : trend > 0
            ? "text-red-500"
            : "text-muted-foreground"
        }`}
      >
        {arrow} {Math.abs(trend).toFixed(1)}
      </span>
    </div>
  );
}

// Overview Cards component for mobile view
function OverviewCards({
  overallAverage,
  subjectsCount,
  gradesCount,
  getGradeColorClass,
  subjects,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <OverviewCard
        title="Overall Average"
        value={
          <span
            className={`text-xl font-bold ${getGradeColorClass(
              overallAverage
            )}`}
          >
            {overallAverage.toFixed(2)}
          </span>
        }
        icon={<BarChart2 className="h-5 w-5 text-primary" />}
      />
      <OverviewCard
        title="Subjects"
        value={subjectsCount}
        icon={<BookIcon className="h-5 w-5 text-primary" />}
      />
      <OverviewCard
        title="Grades Recorded"
        value={gradesCount}
        icon={<ClipboardIcon className="h-5 w-5 text-primary" />}
      />
      <OverviewCard
        title="Recent Trend"
        value={
          <TrendDisplay
            compact={true}
            subjects={subjects}
            getGradeColorClass={getGradeColorClass}
          />
        }
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { subjects, isLoading, refreshSubjects } = useSubjects();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">(
    "3m"
  );
  const [refreshing, setRefreshing] = useState(false);

  // Mobile optimization - track collapsed state of sections
  const [collapsedSections, setCollapsedSections] = useState({
    overview: false,
    subjectComparison: true,
    gradeTrends: true,
    distribution: true,
  });

  // Add new state
  const [activeSection, setActiveSection] = useState("overview");
  const [showInsights, setShowInsights] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");

  // Filter subjects with at least one grade
  const subjectsWithGrades = subjects.filter(
    (subject) => subject.grades && subject.grades.length > 0
  );

  // Calculate overall average grade
  const overallAverage =
    subjectsWithGrades.length > 0
      ? subjectsWithGrades.reduce(
          (sum, subject) => sum + subject.averageGrade,
          0
        ) / subjectsWithGrades.length
      : 0;

  // Get currently selected subject
  const currentSubject =
    selectedSubject && selectedSubject !== "all"
      ? subjects.find((s) => s.id === selectedSubject)
      : null;

  // Calculate additional data for insights
  const recentTrend = calculateRecentTrend(subjects);
  const predictions = predictFuturePerformance(subjects);
  const subjectStrengths = identifyStrengthsAndWeaknesses(subjects);

  // Handle refresh button
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubjects();
    toast({
      title: "Data refreshed",
      description: "Analytics data has been updated",
    });
    setRefreshing(false);
  };

  // Toggle section collapse state
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get grade count
  const totalGradesCount = subjects.reduce(
    (count, subject) => count + (subject.grades?.length || 0),
    0
  );

  // Function to get grade color class
  const getGradeColorClass = (grade: number) => {
    if (grade <= 2.0) return "text-green-500";
    if (grade <= 3.0) return "text-blue-500";
    if (grade <= 4.0) return "text-amber-500";
    return "text-red-500";
  };

  // Function to handle data export
  const handleExportData = async (
    format: "pdf" | "csv",
    showAllGrades: boolean = false
  ) => {
    setExportFormat(format);

    // Show toast with shadcn/ui styling
    toast({
      title: `Preparing ${format.toUpperCase()} export`,
      description: "Your analytics data is being prepared for download",
      // Use this variant for a neutral info message
      variant: "default",
    });

    try {
      if (format === "csv") {
        // Generate CSV content
        let csvContent = "Subject,Average Grade,Number of Grades\n";

        // Add subject data
        subjects.forEach((subject) => {
          if (subject.grades && subject.grades.length > 0) {
            csvContent += `"${subject.name}",${subject.averageGrade.toFixed(
              2
            )},${subject.grades.length}\n`;
          }
        });

        // Add overall average
        csvContent += `\n"Overall Average",${overallAverage.toFixed(
          2
        )},${totalGradesCount}\n`;

        // Add trend analysis
        csvContent += `\nTrend Analysis\nRecent Trend,${recentTrend}\n`;

        if (predictions && predictions.length > 0) {
          csvContent += `Predicted Future Grade,${predictions[2].value.toFixed(
            2
          )}\n`;
        }

        // Strengths section
        csvContent += "\nStrengths Analysis\n";
        if (subjectStrengths.bestSubject) {
          csvContent += `Best Subject,"${subjectStrengths.bestSubject}"\n`;
        }
        if (subjectStrengths.worstSubject) {
          csvContent += `Needs Improvement,"${subjectStrengths.worstSubject}"\n`;
        }
        if (subjectStrengths.mostImproved) {
          csvContent += `Most Improved,"${subjectStrengths.mostImproved}"\n`;
        }

        // Initialize all grades data
        csvContent +=
          "\nAll Grades\nSubject,Grade Value,Grade Type,Date,Weight\n";
        subjects.forEach((subject) => {
          if (subject.grades && subject.grades.length > 0) {
            subject.grades.forEach((grade) => {
              csvContent += `"${subject.name}",${grade.value.toFixed(2)},"${
                grade.type
              }","${grade.date}",${grade.weight || 1}\n`;
            });
          }
        });

        // Create a download link and trigger download
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const date = new Date().toISOString().split("T")[0];

        link.setAttribute("href", url);
        link.setAttribute("download", `grades-analytics-${date}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "CSV Export Complete",
          description: "Your analytics data has been downloaded as a CSV file",
        });
      } else {
        // Updated PDF export using the redesigned utility
        try {
          // Create a printable element with all necessary data
          const elementId = createAnalyticsPrintableElement(
            {
              subjects,
              overallAverage,
              totalGradesCount,
              recentTrend,
              predictions,
              subjectStrengths,
            },
            showAllGrades
          ); // Pass the showAllGrades parameter

          // Generate PDF from that element
          await exportToPDF(
            elementId,
            `grades-analytics-${new Date().toISOString().split("T")[0]}`,
            { quality: 1.5 }
          );

          // Show success message with shadcn/ui toast styling
          toast({
            title: "PDF Export Complete",
            description:
              "Your analytics data has been downloaded as a PDF file",
            variant: "default",
          });

          // Clean up the temporary element
          const tempElement = document.getElementById(elementId);
          if (tempElement) {
            document.body.removeChild(tempElement);
          }
        } catch (pdfError) {
          console.error("PDF generation error:", pdfError);
          toast({
            title: "PDF Export Failed",
            description: "Could not generate PDF. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
        </div>

        <Skeleton className="h-80 mb-6" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-8 max-w-6xl mx-auto px-4 pb-20 sm:pb-6">
      {/* Header with mobile optimization */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span>Analytics Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Visualize and analyze your academic performance
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto sm:ml-0"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* No data alert */}
      {subjects.length === 0 || totalGradesCount === 0 ? (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {subjects.length === 0
              ? "Add subjects to see analytics."
              : "Add grades to your subjects to see analytics."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Mobile Action Buttons - Quick access to insights and goals */}
          <div className="flex gap-2 mb-4 sm:hidden">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setShowInsights(true)}
            >
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setShowGoals(true)}
            >
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </Button>
          </div>

          {/* Mobile-friendly tabs interface - ENHANCED */}
          <div className="block sm:hidden mb-6">
            <Tabs
              defaultValue="overview"
              className="w-full"
              value={activeSection}
              onValueChange={setActiveSection}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="dist">Distribution</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {/* Key performance indicators */}
                <Card className="mb-4 border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Quick Insights</h3>
                        <p className="text-sm text-muted-foreground">
                          {recentTrend === "improving"
                            ? "Your grades are improving! Keep up the good work."
                            : recentTrend === "declining"
                            ? "Your grades are trending downward. Consider additional study time."
                            : "Your grades are stable. Focus on maintaining consistency."}
                        </p>

                        {/* Most improved subject */}
                        {subjectStrengths.mostImproved && (
                          <p className="text-sm mt-2 flex items-center gap-1">
                            <TrendingUpIcon className="h-3 w-3 text-green-500" />
                            Most improved:{" "}
                            <span className="font-medium">
                              {subjectStrengths.mostImproved}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <OverviewCards
                  overallAverage={overallAverage}
                  subjectsCount={subjects.length}
                  gradesCount={totalGradesCount}
                  getGradeColorClass={getGradeColorClass}
                  subjects={subjects}
                />
              </TabsContent>

              <TabsContent value="subjects">
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Subject Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subjects.length > 1 ? (
                      <div className="h-[300px]">
                        <SubjectComparisonChart subjects={subjects} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add more subjects to compare performance.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced trend analysis */}
              <TabsContent value="trends">
                <Card className="mb-6">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Grade Trends</CardTitle>
                    <Select
                      value={selectedSubject || "all"}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjectsWithGrades.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {/* New prediction banner */}
                    {predictions && predictions.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-md">
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          <TrendingUpIcon className="h-3 w-3" />
                          Predicted Performance
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on your current trend, your average grade might
                          be around{" "}
                          <span
                            className={`font-bold ${getGradeColorClass(
                              predictions[0].value
                            )}`}
                          >
                            {predictions[0].value.toFixed(1)}
                          </span>{" "}
                          by the end of the term.
                        </p>
                      </div>
                    )}

                    <div className="h-[300px] touch-manipulation">
                      <GradeTrendChart
                        subjects={
                          selectedSubject && selectedSubject !== "all"
                            ? subjects.filter((s) => s.id === selectedSubject)
                            : subjects
                        }
                        timeRange={timeRange}
                        enableTouch={true}
                      />
                    </div>

                    <div className="flex justify-center mt-4 gap-2">
                      {["1m", "3m", "6m", "1y", "all"].map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            setTimeRange(range as typeof timeRange)
                          }
                        >
                          {range === "1m"
                            ? "1 Month"
                            : range === "3m"
                            ? "3 Months"
                            : range === "6m"
                            ? "6 Months"
                            : range === "1y"
                            ? "1 Year"
                            : "All Time"}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dist">
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Grade Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <GradeDistributionChart subjects={subjects} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop layout - collapsible sections */}
          <div className="hidden sm:block">
            {/* Overview Cards */}
            <Collapsible
              open={!collapsedSections.overview}
              onOpenChange={() => toggleSection("overview")}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  Overview
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {collapsedSections.overview ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <OverviewCard
                    title="Overall Average"
                    value={
                      <span
                        className={`text-2xl font-bold ${getGradeColorClass(
                          overallAverage
                        )}`}
                      >
                        {overallAverage.toFixed(2)}
                      </span>
                    }
                    icon={<BarChart2 className="h-5 w-5 text-primary" />}
                  />
                  <OverviewCard
                    title="Subjects"
                    value={subjects.length}
                    icon={<BookIcon className="h-5 w-5 text-primary" />}
                  />
                  <OverviewCard
                    title="Grades Recorded"
                    value={totalGradesCount}
                    icon={<ClipboardIcon className="h-5 w-5 text-primary" />}
                  />
                  <OverviewCard
                    title="Recent Trend"
                    value={
                      <TrendDisplay
                        subjects={subjects}
                        getGradeColorClass={getGradeColorClass}
                      />
                    }
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* NEW: Performance Insights Section for desktop */}
            <Collapsible className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Performance Insights
                </h2>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleExportData("pdf", false)}
                      >
                        Basic Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportData("pdf", true)}
                      >
                        Detailed Report with All Grades
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("csv")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <PerformanceInsights
                    subjects={subjects}
                    recentTrend={recentTrend}
                    predictions={predictions}
                    strengths={subjectStrengths}
                  />
                </CardContent>
              </Card>
            </Collapsible>

            {/* Subject Comparison */}
            <Collapsible
              open={!collapsedSections.subjectComparison}
              onOpenChange={() => toggleSection("subjectComparison")}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  Subject Comparison
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {collapsedSections.subjectComparison ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-6">
                    {subjects.length > 1 ? (
                      <div className="h-[400px]">
                        <SubjectComparisonChart subjects={subjects} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Add more subjects to compare performance.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Grade Trends */}
            <Collapsible
              open={!collapsedSections.gradeTrends}
              onOpenChange={() => toggleSection("gradeTrends")}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Grade Trends</h2>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedSubject || ""}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsWithGrades.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {collapsedSections.gradeTrends ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <GradeTrendChart
                        subjects={
                          selectedSubject && selectedSubject !== "all"
                            ? subjects.filter((s) => s.id === selectedSubject)
                            : subjects
                        }
                        timeRange={timeRange}
                      />
                    </div>
                    <div className="flex justify-center mt-6 gap-2">
                      {["1m", "3m", "6m", "1y", "all"].map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "outline"}
                          onClick={() =>
                            setTimeRange(range as typeof timeRange)
                          }
                        >
                          {range === "1m"
                            ? "1 Month"
                            : range === "3m"
                            ? "3 Months"
                            : range === "6m"
                            ? "6 Months"
                            : range === "1y"
                            ? "1 Year"
                            : "All Time"}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Grade Distribution */}
            <Collapsible
              open={!collapsedSections.distribution}
              onOpenChange={() => toggleSection("distribution")}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Grade Distribution</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {collapsedSections.distribution ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <GradeDistributionChart subjects={subjects} />
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Subject details section - mobile friendly */}
          {currentSubject && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {currentSubject.name} Details
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubject(null)}
                >
                  View All Subjects
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Average Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <AverageGradeChart subject={currentSubject} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[300px] overflow-auto pr-2 scrollbar-thin">
                      {currentSubject.grades &&
                      currentSubject.grades.length > 0 ? (
                        currentSubject.grades.map((grade, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div>
                              <div className="font-medium">
                                {grade.type}{" "}
                                {grade.weight !== 1 && (
                                  <Badge variant="outline" className="ml-2">
                                    {grade.weight}x
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {grade.date
                                  ? format(new Date(grade.date), "MMM d, yyyy")
                                  : "No date"}
                              </div>
                            </div>
                            <div
                              className={`text-lg font-bold ${getGradeColorClass(
                                grade.value
                              )}`}
                            >
                              {grade.value.toFixed(1)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No grades recorded for this subject yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="block sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <MobileNavigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Insights Modal for mobile */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Performance Insights
            </DialogTitle>
          </DialogHeader>
          <PerformanceInsights
            subjects={subjects}
            recentTrend={recentTrend}
            predictions={predictions}
            strengths={subjectStrengths}
            isMobile={true}
          />
        </DialogContent>
      </Dialog>

      {/* Goals Modal for mobile */}
      <Dialog open={showGoals} onOpenChange={setShowGoals}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Grade Goals
            </DialogTitle>
          </DialogHeader>
          <GradeGoals subjects={subjects} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions for new functionality

function calculateRecentTrend(subjects) {
  // Get all grades from all subjects
  const allGrades = subjects
    .flatMap((subject) => subject.grades || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Insufficient data
  if (allGrades.length < 4) return "stable";

  // Calculate recent trend using the last 4 grades
  const recentGrades = allGrades.slice(0, 4);
  let improvements = 0;
  let declines = 0;

  for (let i = 0; i < recentGrades.length - 1; i++) {
    if (recentGrades[i].value < recentGrades[i + 1].value) improvements++;
    else if (recentGrades[i].value > recentGrades[i + 1].value) declines++;
  }

  if (improvements > declines) return "improving";
  if (declines > improvements) return "declining";
  return "stable";
}

function predictFuturePerformance(subjects) {
  // Simple prediction based on recent trends
  const allGrades = subjects
    .flatMap((subject) => subject.grades || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (allGrades.length < 5) return null;

  // Calculate slope of recent grades
  const recentGrades = allGrades.slice(-5);
  let sum = 0;
  let slope = 0;

  for (let i = 1; i < recentGrades.length; i++) {
    const diff = recentGrades[i].value - recentGrades[i - 1].value;
    sum += diff;
  }

  slope = sum / (recentGrades.length - 1);

  // Predict next 3 values
  const predictions = [];
  let lastValue = recentGrades[recentGrades.length - 1].value;

  for (let i = 1; i <= 3; i++) {
    let predictedValue = lastValue + slope * i;
    // Keep within grade bounds
    predictedValue = Math.max(1.0, Math.min(6.0, predictedValue));

    predictions.push({
      period: i,
      value: predictedValue,
    });
  }

  return predictions;
}

function identifyStrengthsAndWeaknesses(subjects) {
  if (!subjects || subjects.length < 2) return {};

  // Find best and worst subjects
  let bestSubject = null;
  let worstSubject = null;
  let mostImproved = null;

  // Best and worst based on average grade
  for (const subject of subjects) {
    if (!subject.grades || subject.grades.length === 0) continue;

    if (!bestSubject || subject.averageGrade < bestSubject.averageGrade) {
      bestSubject = subject;
    }

    if (!worstSubject || subject.averageGrade > worstSubject.averageGrade) {
      worstSubject = subject;
    }
  }

  // Most improved subject
  let greatestImprovement = 0;

  for (const subject of subjects) {
    if (!subject.grades || subject.grades.length < 3) continue;

    // Sort grades by date
    const sortedGrades = [...subject.grades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate improvement between first and last thirds
    const firstThirdEnd = Math.floor(sortedGrades.length / 3);
    const lastThirdStart = Math.floor((sortedGrades.length * 2) / 3);

    const firstThird = sortedGrades.slice(0, firstThirdEnd);
    const lastThird = sortedGrades.slice(lastThirdStart);

    // Calculate average of each third
    const firstAvg =
      firstThird.reduce((sum, g) => sum + g.value, 0) / firstThird.length;
    const lastAvg =
      lastThird.reduce((sum, g) => sum + g.value, 0) / lastThird.length;

    // Calculate improvement (lower number is better in German grading)
    const improvement = firstAvg - lastAvg;

    if (improvement > greatestImprovement) {
      greatestImprovement = improvement;
      mostImproved = subject.name;
    }
  }

  return {
    bestSubject: bestSubject?.name,
    worstSubject: worstSubject?.name,
    mostImproved,
  };
}
