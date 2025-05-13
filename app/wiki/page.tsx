"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  Calendar,
  CheckCircle2,
  Code,
  Database,
  FileText,
  Github,
  Globe,
  HardDrive,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Import our wiki components
import { WikiHero } from "@/components/wiki/WikiHero";
import { WikiCard } from "@/components/wiki/WikiCard";
import { WikiFeatureCard } from "@/components/wiki/WikiFeatureCard";
import { WikiCodeBlock } from "@/components/wiki/WikiCodeBlock";
import { WikiAlert } from "@/components/wiki/WikiAlert";
import { WikiBadge } from "@/components/wiki/WikiBadge";
import { WikiNavigation } from "@/components/wiki/WikiNavigation";
import { WikiTabs } from "@/components/wiki/WikiTabs";
import { WikiCallout } from "@/components/wiki/WikiCallout";
import { WikiAccordion, WikiAccordionItem } from "@/components/wiki/WikiAccordion";
import { WikiTimeline } from "@/components/wiki/WikiTimeline";
import { WikiComparisonTable } from "@/components/wiki/WikiComparisonTable";
import { WikiTable } from "@/components/wiki/WikiTable";

export default function WikiPage() {
  // Add useEffect to ensure default tab is properly shown on load
  useEffect(() => {
    // Give the UI a moment to fully render before activating the tab
    const timer = setTimeout(() => {
      // Find the default tab trigger and click it
      const defaultTab = document.querySelector('[value="getting-started"]');
      if (defaultTab) {
        defaultTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-6xl">
      {/* Enhanced Hero Section with Gradient and Animation */}      <WikiHero
        title="Grade Tracker Wiki"
        description="Everything you need to know about deploying, using, and customizing the Grade Tracker app"
        icon={<Book className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />}
        badges={
          <>
            <WikiBadge>React & Next.js</WikiBadge>
            <WikiBadge variant="secondary">Appwrite Backend</WikiBadge>
            <WikiBadge variant="accent">Responsive Design</WikiBadge>
          </>
        }
      />
        <Tabs defaultValue="getting-started" className="mt-4 sm:mt-6">
        <TabsList className="mb-4 flex space-x-1 rounded-md bg-muted p-1">
          <TabsTrigger value="getting-started" className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            <span>Getting Started</span>
          </TabsTrigger>          <TabsTrigger value="deployment" className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>Deployment</span>
          </TabsTrigger>
          <TabsTrigger value="user-guide" className="flex items-center gap-1.5">
            <Book className="h-3.5 w-3.5" />
            <span>User Guide</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            <span>Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Troubleshooting</span>
          </TabsTrigger>        </TabsList>

        {/* Getting Started Section */}
        <TabsContent value="getting-started">
          <div className="grid gap-4 md:gap-6">
            <WikiCard
              icon={<Info className="h-5 w-5 text-primary" />}
              title="About Grade Tracker"
              description="Learn what Grade Tracker is and how it can help students"
            >
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src="/images/dashboard-preview.png"
                    alt="Grade Tracker Dashboard"
                    className="w-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>                <h3 className="text-lg sm:text-xl font-bold">What is Grade Tracker?</h3>
                <p className="text-xs sm:text-base">
                  Grade Tracker is a comprehensive academic performance tracking application designed 
                  for students to monitor their grades, track assignments, plan their schedules, and
                  visualize their academic progress.
                </p>

                <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">Key Features</h3>
                <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-xs sm:text-base">
                  <li><strong>Grade Management:</strong> Track grades across all subjects and calculate averages automatically</li>
                  <li><strong>Test Tracking:</strong> Manage upcoming tests and assignments with priority levels</li>
                  <li><strong>Calendar:</strong> Comprehensive academic calendar with timetable integration</li>
                  <li><strong>Analytics:</strong> Visual representations of academic performance over time</li>
                  <li><strong>Cloud Sync:</strong> Optional Appwrite integration for cross-device synchronization</li>
                  <li><strong>Offline Support:</strong> Full functionality even without internet connection</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">Technical Overview</h3>
                <p className="text-xs sm:text-base">
                  Grade Tracker is built using Next.js with React, TypeScript, and Tailwind CSS for the frontend. 
                  Data can be stored locally in the browser or synchronized with an Appwrite backend for cloud storage.
                </p>
              </div>
            </WikiCard>
              <WikiCard
              icon={<Code className="h-5 w-5 text-primary" />}
              title="Quick Start for Developers"
              description="Get the application up and running in development mode"
              delay={0.1}
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-bold">
                  Prerequisites
                </h3>
                <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-xs sm:text-base">
                  <li>Node.js (v16.14.0 or higher)</li>
                  <li>npm, pnpm, or yarn package manager</li>
                  <li>Git (for cloning the repository)</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                  Installation Steps
                </h3>
                <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-xs sm:text-base">
                  <li>                    <p className="font-semibold">Clone the repository:</p>
                    <WikiCodeBlock
                      code="git clone https://github.com/Nefnief-tech/grades-tracker.git"
                      language="bash"
                    />
                  </li>
                  <li>
                    <p className="font-semibold">
                      Navigate to the project directory:
                    </p>
                    <WikiCodeBlock
                      code="cd grade-tracker-v2"
                      language="bash"
                    />
                  </li>
                  <li>
                    <p className="font-semibold">Install dependencies:</p>
                    <WikiCodeBlock
                      code="npm install
# or
pnpm install"
                      language="bash"
                    />
                  </li>
                  <li>
                    <p className="font-semibold">
                      Set up environment variables:
                    </p>
                    <p className="text-xs sm:text-sm">
                      Create a <code>.env.local</code> file in the project
                      root with the following variables:
                    </p>
                    <WikiCodeBlock
                      code={`NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID=your-subjects-collection-id
NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID=your-grades-collection-id
NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID=your-tests-collection-id
NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID=your-timetable-collection-id`}
                      language="bash"
                    />
                  </li>
                  <li>
                    <p className="font-semibold">
                      Start the development server:
                    </p>
                    <WikiCodeBlock
                      code={`npm run dev
# or
pnpm dev`}
                      language="bash"
                    />
                  </li>
                </ol>

                <p className="mt-3 sm:mt-4 text-xs sm:text-base">
                  The application will be available at{" "}
                  <code>http://localhost:3000</code>. If you need to run the
                  app in local-only mode without Appwrite, you can use:
                </p>
                <WikiCodeBlock
                  code="npm run local-mode"
                  language="bash"
                />
              </div>
            </WikiCard>
          </div>
        </TabsContent>

        {/* Placeholder for other sections */}        <TabsContent value="deployment">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Web Deployment Options
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How to deploy Grade Tracker to various platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Deploying to Vercel</h3>
                    <p className="mt-2 text-xs sm:text-base">
                      Vercel offers the simplest deployment experience for Next.js applications.
                    </p>
                    <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 mt-3 sm:mt-4 text-xs sm:text-base">
                      <li>
                        Create an account on{" "}
                        <a
                          href="https://vercel.com"
                          className="text-primary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Vercel
                        </a>
                      </li>
                      <li>Connect your GitHub repository</li>
                      <li>
                        <p>
                          Configure environment variables in the Vercel dashboard:
                        </p>
                        <ul className="list-disc pl-4 sm:pl-6 text-xs sm:text-sm">
                          <li>NEXT_PUBLIC_APPWRITE_ENDPOINT</li>
                          <li>NEXT_PUBLIC_APPWRITE_PROJECT_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_DATABASE_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID</li>
                          <li>NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID</li>
                        </ul>
                      </li>
                      <li>Deploy the project from the Vercel dashboard</li>
                    </ol>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-bold">Deploying with Docker</h3>
                    <p className="mt-2 text-xs sm:text-base">
                      The project includes Docker configuration for containerized deployments.
                    </p>
                    <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 mt-3 sm:mt-4 text-xs sm:text-base">
                      <li>
                        <p className="font-semibold">Build the Docker image:</p>
                        <WikiCodeBlock
                          code="docker build -t grade-tracker:latest ."
                          language="bash"
                        />
                      </li>
                      <li>
                        <p className="font-semibold">Run the Docker container:</p>
                        <WikiCodeBlock
                          code="docker run -p 3000:3000 --env-file .env.local grade-tracker:latest"
                          language="bash"
                        />
                      </li>
                      <li>
                        <p className="font-semibold">For automated Docker builds, you can use the included scripts:</p>
                        <WikiCodeBlock
                          code="./docker-build-skip-check.sh
# or for Windows
docker-build-skip-check.bat"
                          language="bash"
                        />
                      </li>
                    </ol>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-base">
                      For detailed Docker deployment instructions, refer to the{" "}
                      <code>docker-build-instructions.md</code> file.
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-bold">Other Deployment Options</h3>
                    <p className="mt-2 text-xs sm:text-base">
                      The application can also be deployed to platforms like Railway and Fly.io.
                    </p>
                    <WikiComparisonTable
                      options={["Vercel", "Railway", "Fly.io", "Docker"]}
                      features={[
                        {
                          feature: "Next.js Integration",
                          description: "Native support for Next.js features",
                          options: {
                            "Vercel": "Excellent",
                            "Railway": "Good",
                            "Fly.io": "Good",
                            "Docker": "Manual configuration"
                          }
                        },
                        {
                          feature: "Deployment Ease",
                          description: "How easy it is to set up and deploy",
                          options: {
                            "Vercel": "Very Easy",
                            "Railway": "Easy",
                            "Fly.io": "Moderate",
                            "Docker": "Complex"
                          }
                        },
                        {
                          feature: "CI/CD Integration",
                          options: {
                            "Vercel": true,
                            "Railway": true,
                            "Fly.io": true,
                            "Docker": true
                          }
                        },
                        {
                          feature: "Free Tier",
                          options: {
                            "Vercel": true,
                            "Railway": true,
                            "Fly.io": true,
                            "Docker": null
                          }
                        },
                        {
                          feature: "Self-hosting Option",
                          options: {
                            "Vercel": false,
                            "Railway": false,
                            "Fly.io": false,
                            "Docker": true
                          }
                        }
                      ]}
                      highlightColumn={0}
                      caption="Deployment Platform Comparison"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Appwrite Setup Guide
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure the Appwrite backend for cloud synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Appwrite Installation
                  </h3>
                  <p className="text-xs sm:text-base">
                    Grade Tracker uses Appwrite as its backend service for user
                    authentication and data storage. You can either use the
                    Appwrite Cloud service or self-host Appwrite on your own
                    infrastructure.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 sm:mt-4">
                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold">
                        Option 1: Appwrite Cloud
                      </h4>
                      <ol className="list-decimal pl-4 sm:pl-6 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>
                          Sign up for{" "}
                          <a
                            href="https://cloud.appwrite.io"
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Appwrite Cloud
                          </a>
                        </li>
                        <li>Create a new project</li>
                        <li>
                          Get your API endpoint and project ID from the
                          dashboard
                        </li>
                      </ol>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold">
                        Option 2: Self-hosted Appwrite
                      </h4>
                      <ol className="list-decimal pl-4 sm:pl-6 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>
                          Follow the{" "}
                          <a
                            href="https://appwrite.io/docs/self-hosting"
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Appwrite Self-hosting Guide
                          </a>
                        </li>
                        <li>Set up Docker and Docker Compose on your server</li>
                        <li>
                          Deploy Appwrite using the provided Docker Compose
                          setup
                        </li>
                      </ol>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Configuring Appwrite for Grade Tracker
                  </h3>
                  <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                    <ol className="list-decimal pl-4 sm:pl-6 space-y-2 text-xs sm:text-sm">
                      <li>
                        <p className="font-semibold">Create a Database:</p>
                        <ul className="list-disc pl-4 text-xs">
                          <li>Go to Databases in the Appwrite console</li>
                          <li>Create a new database (e.g., "grade-tracker")</li>
                          <li>
                            Note the Database ID for your environment variables
                          </li>
                        </ul>
                      </li>
                      <li>
                        <p className="font-semibold">Create Collections:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-1">
                          <div className="bg-muted rounded p-1 text-center text-xs">
                            users
                          </div>
                          <div className="bg-muted rounded p-1 text-center text-xs">
                            subjects
                          </div>
                          <div className="bg-muted rounded p-1 text-center text-xs">
                            grades
                          </div>
                          <div className="bg-muted rounded p-1 text-center text-xs">
                            tests
                          </div>
                          <div className="bg-muted rounded p-1 text-center text-xs">
                            timetableEntries
                          </div>
                        </div>
                      </li>
                      <li>
                        <p className="font-semibold">
                          Set Up Permissions and Attributes:
                        </p>
                        <ul className="list-disc pl-4 text-xs">
                          <li>
                            Configure read/write permissions for each collection
                          </li>
                          <li>
                            Create necessary attributes (userId, name, etc.)
                          </li>
                          <li>Set up indexes for improved query performance</li>
                        </ul>
                      </li>
                      <li>
                        <p className="font-semibold">Enable Authentication:</p>
                        <ul className="list-disc pl-4 text-xs">
                          <li>Go to Auth → Settings → Providers</li>
                          <li>Enable Email/Password authentication</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                  
                  <WikiCallout type="important" title="Security Best Practices">
                    <p className="text-xs mt-1">
                      When deploying to production, ensure you set up appropriate security measures:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 mt-2 text-xs">
                      <li>Enable email verification for user accounts</li>
                      <li>Set up proper CORS rules to restrict unauthorized access</li>
                      <li>Create separate API keys for different services with minimum required permissions</li>
                      <li>Regularly audit collection permissions and API usage</li>
                    </ul>
                  </WikiCallout>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
          <TabsContent value="user-guide">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Using Grade Tracker
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Learn how to use the main features of Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold">Getting Started</h3>
                  <WikiTimeline
                    items={[
                      {
                        title: "Create an account or use local mode",
                        description: "You can either create an account to enable cloud synchronization or use the app in local-only mode where all data is stored in your browser.",
                        status: "completed",
                        date: "Step 1"
                      },
                      {
                        title: "Add your subjects",
                        description: "Navigate to the Subjects page and add your academic subjects. You can customize the color for each subject.",
                        status: "completed",
                        date: "Step 2"
                      },
                      {
                        title: "Add grades to your subjects",
                        description: "Click on a subject card to open its detail page, then add grades using the 'Add Grade' button. You can specify the grade value, type, date, and weight.",
                        status: "current",
                        date: "Step 3"
                      },
                      {
                        title: "Set up your timetable",
                        description: "Go to the Calendar page and add your class schedule. These entries will appear in your calendar.",
                        status: "upcoming",
                        date: "Step 4"
                      },
                      {
                        title: "Add upcoming tests",
                        description: "Navigate to the Tests page to add and manage your upcoming exams and assignments.",
                        status: "upcoming",
                        date: "Step 5"
                      }
                    ]}
                    className="mb-6"
                  />                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">Feature Guides</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 sm:mt-4">
                    <WikiFeatureCard
                      icon={<LineChart className="h-5 w-5" />}
                      title="Grade Management"
                      description="Add grades with customizable weights, view automatic average calculations, edit or delete existing grades, filter grades by type or date"
                      delay={0.1}
                    />

                    <WikiFeatureCard
                      icon={<Calendar className="h-5 w-5" />}
                      title="Academic Calendar" 
                      description="View schedule in calendar format, add recurring or one-time classes, see upcoming tests and assignments, toggle day, week, and month views"
                      delay={0.2}
                    />

                    <WikiFeatureCard
                      icon={<CheckCircle2 className="h-5 w-5" />}
                      title="Test Tracking"
                      description="Manage tests with priority levels, set reminders for important tests, mark tests as completed, filter and sort by various criteria"
                      delay={0.3}
                    />

                    <WikiFeatureCard
                      icon={<LineChart className="h-5 w-5" />}
                      title="Analytics"
                      description="View visual performance reports, track grade trends over time, compare across different subjects, analyze grade distributions"
                      delay={0.4}
                    />
                  </div>

                  <WikiCallout type="important" title="Cloud Synchronization">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div>
                        <h5 className="text-sm font-medium">Benefits:</h5>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs sm:text-sm">
                          <li>Access data across multiple devices</li>
                          <li>Automatic backup of your information</li>
                          <li>Never lose your grades and schedule</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">How to enable:</h5>
                        <ol className="list-decimal pl-4 space-y-1 mt-1 text-xs sm:text-sm">
                          <li>Create an account or log in</li>
                          <li>Go to Settings</li>
                          <li>Toggle "Enable Cloud Sync"</li>
                          <li>Your data will sync automatically</li>
                        </ol>
                      </div>
                    </div>
                  </WikiCallout>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">Data Management</h3>
                  <WikiAccordion className="mt-4">
                    <WikiAccordionItem title="Importing Data" defaultOpen>
                      <p className="text-xs mt-1">
                        You can import existing academic data from CSV files or other grade tracking systems.
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 mt-2 text-xs">
                        <li>Navigate to Settings → Data Management</li>
                        <li>Click on "Import Data"</li>
                        <li>Select file format and upload your data</li>
                        <li>Map columns to Grade Tracker fields</li>
                        <li>Confirm and complete the import</li>
                      </ol>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Exporting Your Data">
                      <p className="text-xs mt-1">
                        Grade Tracker allows you to export your data in multiple formats.
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="bg-muted/30 p-2 rounded text-center text-xs">
                          CSV Format
                        </div>
                        <div className="bg-muted/30 p-2 rounded text-center text-xs">
                          PDF Reports
                        </div>
                        <div className="bg-muted/30 p-2 rounded text-center text-xs">
                          JSON Backup
                        </div>
                        <div className="bg-muted/30 p-2 rounded text-center text-xs">
                          Excel Spreadsheet
                        </div>
                      </div>
                      <p className="text-xs mt-2">
                        To export, go to Settings → Data Management → Export Data and select your preferred format.
                      </p>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Data Privacy & Security">
                      <p className="text-xs mt-1">
                        Grade Tracker takes your data privacy seriously. Here's how we protect your information:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs">
                        <li>End-to-end encryption for cloud-stored data</li>
                        <li>Option to use local-only storage without cloud sync</li>
                        <li>No tracking or analytics in the core application</li>
                        <li>Regular security audits and updates</li>
                        <li>Data deletion options in user settings</li>
                      </ul>
                    </WikiAccordionItem>
                  </WikiAccordion>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
          <TabsContent value="configuration">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Configuration Options
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Customize the Grade Tracker application
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">Environment Variables</h3>
                  <p className="text-xs sm:text-base">
                    The application can be configured using environment variables. Here's a comprehensive list:
                  </p>
                  <WikiTable
                    headers={["Variable", "Description", "Default"]}
                    rows={[
                      ["NEXT_PUBLIC_APPWRITE_ENDPOINT", "API endpoint URL for Appwrite", "https://cloud.appwrite.io/v1"],
                      ["NEXT_PUBLIC_APPWRITE_PROJECT_ID", "Appwrite project ID", "-"],
                      ["NEXT_PUBLIC_APPWRITE_DATABASE_ID", "Database ID in Appwrite", "-"],
                      ["NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID", "Collection ID for users data", "-"],
                      ["NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID", "Collection ID for subjects data", "-"],
                      ["NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID", "Collection ID for grades data", "-"],
                      ["NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID", "Collection ID for tests data", "-"],
                      ["NEXT_PUBLIC_ENABLE_ANALYTICS", "Enable or disable analytics tracking", "false"]
                    ]}
                    caption="Environment Variables Configuration"
                  />

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">Application Settings</h3>
                  <WikiAccordion className="mt-4">
                    <WikiAccordionItem title="Theme Customization" defaultOpen>
                      <p className="text-xs mt-1">
                        Grade Tracker supports light and dark mode themes.
                      </p>
                      <WikiCodeBlock
                        code={`// In tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        // Customize your color palette here
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ...other color definitions
      },
    },
  },
}`}
                        language="typescript"
                      />
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Local Storage Settings">
                      <p className="text-xs mt-1">
                        Control how data is stored locally in the browser.
                      </p>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Navigate to Settings → Storage in the app to customize these options.
                      </div>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs">
                        <li>Data retention period (default: indefinite)</li>
                        <li>Storage encryption (default: enabled)</li>
                        <li>Auto-backup frequency (default: daily)</li>
                      </ul>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Cloud Sync Configuration">
                      <p className="text-xs mt-1">
                        Settings for Appwrite cloud synchronization.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <h5 className="text-sm font-medium">Sync Options</h5>
                          <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                            <li>Auto-sync on changes (toggle)</li>
                            <li>Background sync interval</li>
                            <li>Conflict resolution strategy</li>
                          </ul>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <h5 className="text-sm font-medium">Data Privacy</h5>
                          <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                            <li>Client-side encryption</li>
                            <li>Selective sync for data types</li>
                            <li>Data purging options</li>
                          </ul>
                        </div>
                      </div>
                    </WikiAccordionItem>
                  </WikiAccordion>
                </div>
              </CardContent>
            </Card>

            <WikiCard
              icon={<Database className="h-5 w-5 text-primary" />}
              title="Database Configuration"
              description="Setting up the database for Grade Tracker"
            >
              <div className="space-y-4">
                <p className="text-xs sm:text-base">
                  Grade Tracker uses Appwrite as its backend database service. Here's how to configure the database collections:
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-2 text-left">Collection</th>
                        <th className="py-2 px-2 text-left">Description</th>
                        <th className="py-2 px-2 text-left">Key Fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-2 font-medium">users</td>
                        <td className="py-2 px-2">User profiles and preferences</td>
                        <td className="py-2 px-2">id, name, email, settings</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2 font-medium">subjects</td>
                        <td className="py-2 px-2">Academic subjects</td>
                        <td className="py-2 px-2">id, name, color, userId</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2 font-medium">grades</td>
                        <td className="py-2 px-2">Individual grade entries</td>
                        <td className="py-2 px-2">id, value, weight, subjectId, userId</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2 font-medium">tests</td>
                        <td className="py-2 px-2">Upcoming test entries</td>
                        <td className="py-2 px-2">id, title, date, subjectId, userId</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <WikiCallout type="tip" title="Schema Validation">
                  <p className="text-xs">
                    Appwrite provides schema validation to ensure data integrity. Make sure to set up proper validation rules for each collection.
                  </p>
                </WikiCallout>
              </div>
            </WikiCard>
          </div>
        </TabsContent>
          <TabsContent value="troubleshooting">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Common Issues & Solutions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Troubleshoot typical problems with Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">Authentication Issues</h3>
                  <WikiAlert
                    title="Problem: Unable to log in"
                    variant="danger"
                  >
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-xs sm:text-sm">
                          Possible causes:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Incorrect Appwrite configuration</li>
                          <li>Network connectivity problems</li>
                          <li>Email authentication not enabled</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-xs sm:text-sm">
                          Solutions:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Verify environment variables</li>
                          <li>Check browser console for errors</li>
                          <li>Enable authentication in Appwrite</li>
                          <li>Check CORS settings</li>
                        </ul>
                      </div>
                    </div>
                  </WikiAlert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Data not syncing to cloud
                      </h4>
                      <div className="mt-2">
                        <p className="font-semibold text-xs">Solutions:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Check sync is enabled in settings</li>
                          <li>Verify network connectivity</li>
                          <li>Check Appwrite permissions</li>
                          <li>Validate collection IDs</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Data appears to be lost
                      </h4>
                      <div className="mt-2">
                        <p className="font-semibold text-xs">Solutions:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Enable cloud sync and log in</li>
                          <li>Check browser local storage</li>
                          <li>Avoid using private browsing mode</li>
                          <li>Use "Force refresh from cloud" option</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm sm:text-base font-semibold">
                        App is slow or unresponsive
                      </h4>
                      <div className="mt-2">
                        <p className="font-semibold text-xs">Solutions:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Enable cloud sync to offload data</li>
                          <li>Archive old subjects</li>
                          <li>Clear browser cache and reload</li>
                          <li>Update to latest browser version</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Page not rendering correctly
                      </h4>
                      <div className="mt-2">
                        <p className="font-semibold text-xs">Solutions:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Try hard-refreshing the page (Ctrl+F5)</li>
                          <li>Clear application cache in settings</li>
                          <li>Check console for JavaScript errors</li>
                          <li>Try a different browser</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <WikiCallout type="warning" title="Data Loss Prevention">
                    <p className="text-xs mt-1">
                      Always back up your data periodically, especially before updating the application or clearing browser data.
                      Use the Export feature in Settings to download all your data in JSON format.
                    </p>
                  </WikiCallout>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <LifeBuoy className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Getting Help
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Where to find additional support
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-base">
                    If you're encountering issues not covered in the troubleshooting guide, there are several resources available for getting help:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3 sm:mt-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Github className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold">
                            GitHub Issues
                          </h4>
                          <p className="text-xs mt-1">
                            Report bugs or request features
                          </p>                          <a
                            href="https://github.com/Nefnief-tech/grades-tracker.git/issues"
                            className="text-xs text-primary inline-block mt-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open an issue →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold">
                            Documentation
                          </h4>
                          <p className="text-xs mt-1">Review detailed docs</p>
                          <a
                            href="/docs"
                            className="text-xs text-primary inline-block mt-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Browse docs →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold">
                            Appwrite Docs
                          </h4>
                          <p className="text-xs mt-1">For backend issues</p>
                          <a
                            href="https://appwrite.io/docs"
                            className="text-xs text-primary inline-block mt-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Appwrite →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold mt-4">Debugging Tools</h3>
                  
                  <WikiAccordion>
                    <WikiAccordionItem title="Browser Developer Tools" defaultOpen>
                      <div className="space-y-2 mt-2">
                        <p className="text-xs">Check the console for JavaScript errors:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-xs">
                          <li>Open developer tools (F12 or right-click → Inspect)</li>
                          <li>Navigate to the Console tab</li>
                          <li>Look for red error messages</li>
                          <li>Report specific error messages when seeking help</li>
                        </ol>
                      </div>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Network Debugging">
                      <div className="space-y-2 mt-2">
                        <p className="text-xs">Check API requests to Appwrite:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-xs">
                          <li>Open developer tools (F12)</li>
                          <li>Navigate to the Network tab</li>
                          <li>Filter by "fetch" or "xhr"</li>
                          <li>Look for failed requests (red)</li>
                          <li>Check response codes and error messages</li>
                        </ol>
                      </div>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem title="Diagnostic Mode">
                      <div className="space-y-2 mt-2">
                        <p className="text-xs">Enable detailed logging:</p>
                        <WikiCodeBlock
                          code={`// In the browser console:
localStorage.setItem('GT_DEBUG_MODE', 'true');
// Then refresh the page`}
                          language="javascript"
                        />
                        <p className="text-xs mt-2">This will enable verbose logging in the console, showing all API calls, state changes, and potential issues.</p>
                      </div>
                    </WikiAccordionItem>
                  </WikiAccordion>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>      </Tabs>
    </div>
  );
}
