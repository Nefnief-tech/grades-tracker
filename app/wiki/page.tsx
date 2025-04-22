"use client";

import React from "react";
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
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function WikiPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Grade Tracker Wiki
          </h1>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2">
          Everything you need to know about deploying, using, and customizing
          the Grade Tracker app.
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="mt-4 sm:mt-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full max-w-4xl mb-6 md:mb-8 overflow-x-auto">
          <TabsTrigger
            value="getting-started"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Getting Started
          </TabsTrigger>
          <TabsTrigger
            value="deployment"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Deployment
          </TabsTrigger>
          <TabsTrigger
            value="user-guide"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            User Guide
          </TabsTrigger>
          <TabsTrigger
            value="configuration"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value="troubleshooting"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Troubleshooting
          </TabsTrigger>
        </TabsList>

        {/* Getting Started Section */}
        <TabsContent value="getting-started">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                  About Grade Tracker
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Learn what Grade Tracker is and how it can help students
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
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
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold">
                    What is Grade Tracker?
                  </h3>
                  <p className="text-xs sm:text-base">
                    Grade Tracker is a comprehensive academic performance
                    tracking application designed for students to monitor their
                    grades, track assignments, plan their schedules, and
                    visualize their academic progress.
                  </p>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Key Features
                  </h3>
                  <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-xs sm:text-base">
                    <li>
                      <strong>Grade Management:</strong> Track grades across all
                      subjects and calculate averages automatically
                    </li>
                    <li>
                      <strong>Test Tracking:</strong> Manage upcoming tests and
                      assignments with priority levels
                    </li>
                    <li>
                      <strong>Calendar:</strong> Comprehensive academic calendar
                      with timetable integration
                    </li>
                    <li>
                      <strong>Analytics:</strong> Visual representations of
                      academic performance over time
                    </li>
                    <li>
                      <strong>Cloud Sync:</strong> Optional Appwrite integration
                      for cross-device synchronization
                    </li>
                    <li>
                      <strong>Offline Support:</strong> Full functionality even
                      without internet connection
                    </li>
                  </ul>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Technical Overview
                  </h3>
                  <p className="text-xs sm:text-base">
                    Grade Tracker is built using Next.js with React, TypeScript,
                    and Tailwind CSS for the frontend. Data can be stored
                    locally in the browser or synchronized with an Appwrite
                    backend for cloud storage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                  Quick Start for Developers
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Get the application up and running in development mode
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
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
                    <li>
                      <p className="font-semibold">Clone the repository:</p>
                      <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                        <code>
                          git clone
                          https://github.com/yourusername/grade-tracker-v2.git
                        </code>
                      </pre>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Navigate to the project directory:
                      </p>
                      <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                        <code>cd grade-tracker-v2</code>
                      </pre>
                    </li>
                    <li>
                      <p className="font-semibold">Install dependencies:</p>
                      <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                        <code>npm install</code>
                        <br />
                        <span className="text-muted-foreground"># or</span>
                        <br />
                        <code>pnpm install</code>
                      </pre>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Set up environment variables:
                      </p>
                      <p className="text-xs sm:text-sm">
                        Create a <code>.env.local</code> file in the project
                        root with the following variables:
                      </p>
                      <div className="overflow-x-auto">
                        <pre className="bg-muted p-2 sm:p-3 rounded-md text-xs whitespace-pre">
                          <code>
                            NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID=your-subjects-collection-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID=your-grades-collection-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID=your-tests-collection-id
                          </code>
                          <br />
                          <code>
                            NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID=your-timetable-collection-id
                          </code>
                        </pre>
                      </div>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Start the development server:
                      </p>
                      <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                        <code>npm run dev</code>
                        <br />
                        <span className="text-muted-foreground"># or</span>
                        <br />
                        <code>pnpm dev</code>
                      </pre>
                    </li>
                  </ol>

                  <p className="mt-3 sm:mt-4 text-xs sm:text-base">
                    The application will be available at{" "}
                    <code>http://localhost:3000</code>. If you need to run the
                    app in local-only mode without Appwrite, you can use:
                  </p>
                  <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                    <code>npm run local-mode</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deployment Section */}
        <TabsContent value="deployment">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  Web Deployment Options
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How to deploy Grade Tracker to various platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      Deploying to Vercel
                    </h3>
                    <p className="mt-2 text-xs sm:text-base">
                      Vercel offers the simplest deployment experience for
                      Next.js applications.
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
                          Configure environment variables in the Vercel
                          dashboard:
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
                    <h3 className="text-lg sm:text-xl font-bold">
                      Deploying with Docker
                    </h3>
                    <p className="mt-2 text-xs sm:text-base">
                      The project includes Docker configuration for
                      containerized deployments.
                    </p>
                    <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 mt-3 sm:mt-4 text-xs sm:text-base">
                      <li>
                        <p className="font-semibold">Build the Docker image:</p>
                        <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                          <code>docker build -t grade-tracker:latest .</code>
                        </pre>
                      </li>
                      <li>
                        <p className="font-semibold">
                          Run the Docker container:
                        </p>
                        <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                          <code>
                            docker run -p 3000:3000 --env-file .env.local
                            grade-tracker:latest
                          </code>
                        </pre>
                      </li>
                      <li>
                        <p className="font-semibold">
                          For automated Docker builds, you can use the included
                          scripts:
                        </p>
                        <pre className="bg-muted p-2 sm:p-3 rounded-md overflow-x-auto text-xs">
                          <code>./docker-build-skip-check.sh</code>
                          <br />
                          <span className="text-muted-foreground">
                            # or for Windows
                          </span>
                          <br />
                          <code>docker-build-skip-check.bat</code>
                        </pre>
                      </li>
                    </ol>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-base">
                      For detailed Docker deployment instructions, refer to the{" "}
                      <code>docker-build-instructions.md</code> file.
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-bold">
                      Other Deployment Options
                    </h3>
                    <p className="mt-2 text-xs sm:text-base">
                      The application can also be deployed to platforms like
                      Railway and Fly.io.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 sm:mt-4">
                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base">
                          Railway
                        </h4>
                        <ol className="list-decimal pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                          <li>Create an account on Railway</li>
                          <li>Connect your GitHub repository</li>
                          <li>Add the necessary environment variables</li>
                          <li>
                            Deploy using the <code>railway.toml</code> config
                          </li>
                        </ol>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-sm sm:text-base">
                          Fly.io
                        </h4>
                        <ol className="list-decimal pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                          <li>Install the Fly CLI</li>
                          <li>
                            Run <code>fly auth login</code>
                          </li>
                          <li>
                            Deploy with <code>fly launch</code>
                          </li>
                          <li>
                            Configure using the included <code>fly.toml</code>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5" />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Guide Section */}
        <TabsContent value="user-guide">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  Using Grade Tracker
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Learn how to use the main features of Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Getting Started
                  </h3>
                  <ol className="list-decimal pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-xs sm:text-base">
                    <li>
                      <p className="font-semibold">
                        Create an account or use local mode:
                      </p>
                      <p>
                        You can either create an account to enable cloud
                        synchronization or use the app in local-only mode where
                        all data is stored in your browser.
                      </p>
                    </li>
                    <li>
                      <p className="font-semibold">Add your subjects:</p>
                      <p>
                        Navigate to the Subjects page and add your academic
                        subjects. You can customize the color for each subject.
                      </p>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Add grades to your subjects:
                      </p>
                      <p>
                        Click on a subject card to open its detail page, then
                        add grades using the "Add Grade" button. You can specify
                        the grade value, type, date, and weight.
                      </p>
                    </li>
                    <li>
                      <p className="font-semibold">Set up your timetable:</p>
                      <p>
                        Go to the Calendar page and add your class schedule.
                        These entries will appear in your calendar.
                      </p>
                    </li>
                    <li>
                      <p className="font-semibold">Add upcoming tests:</p>
                      <p>
                        Navigate to the Tests page to add and manage your
                        upcoming exams and assignments.
                      </p>
                    </li>
                  </ol>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Feature Guides
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mt-3 sm:mt-4">
                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base font-semibold">
                        Grade Management
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>Add grades with customizable weights</li>
                        <li>View automatic average calculations</li>
                        <li>Edit or delete existing grades</li>
                        <li>Filter grades by type or date</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base font-semibold">
                        Academic Calendar
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>View schedule in calendar format</li>
                        <li>Add recurring or one-time classes</li>
                        <li>See upcoming tests and assignments</li>
                        <li>Toggle day, week, and month views</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base font-semibold">Test Tracking</h4>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>Manage tests with priority levels</li>
                        <li>Set reminders for important tests</li>
                        <li>Mark tests as completed</li>
                        <li>Filter and sort by various criteria</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4">
                      <h4 className="text-base font-semibold">Analytics</h4>
                      <ul className="list-disc pl-4 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>View visual performance reports</li>
                        <li>Track grade trends over time</li>
                        <li>Compare across different subjects</li>
                        <li>Analyze grade distributions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                    <h4 className="text-base font-semibold">
                      Cloud Synchronization
                    </h4>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Administrator Guide
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Managing the Grade Tracker deployment as an administrator
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Administrative Tasks
                  </h3>
                  <p className="text-xs sm:text-base">
                    As an administrator, you'll need to manage the deployment
                    and ensure the application is running correctly.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-3 sm:mt-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Monitoring
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                        <li>Check server logs for errors</li>
                        <li>Monitor Appwrite usage and quotas</li>
                        <li>Set up alerts for API failures</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Backups
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                        <li>Set up regular database backups</li>
                        <li>Implement disaster recovery</li>
                        <li>Test data restoration regularly</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm sm:text-base font-semibold">
                        User Management
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                        <li>Manage accounts in Appwrite console</li>
                        <li>Handle password resets and issues</li>
                        <li>Monitor for suspicious activity</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm sm:text-base font-semibold">
                        Updates & Maintenance
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                        <li>Keep frontend and backend updated</li>
                        <li>Schedule maintenance windows</li>
                        <li>Communicate changes to users</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Section */}
        <TabsContent value="configuration">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  Configuration Options
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Customize the Grade Tracker application
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Environment Variables
                  </h3>
                  <p className="text-xs sm:text-base">
                    The application can be configured using environment
                    variables. Here's a comprehensive list:
                  </p>

                  <div className="overflow-x-auto mt-2 sm:mt-4 border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold">
                            Variable
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold">
                            Description
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold">
                            Default
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        <tr>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-mono text-xs">
                            NEXT_PUBLIC_APPWRITE_ENDPOINT
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            API endpoint URL
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            appwrite.nief.tech/v1
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-mono text-xs">
                            NEXT_PUBLIC_APPWRITE_PROJECT_ID
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            Project ID
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">-</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-mono text-xs">
                            NEXT_PUBLIC_APPWRITE_DATABASE_ID
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            Database ID
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">-</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-mono text-xs">
                            NEXT_PUBLIC_ENABLE_ANALYTICS
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            Enable analytics
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">true</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scroll horizontally to see all environment variables
                  </p>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Feature Flags
                  </h3>
                  <p className="text-xs sm:text-base">
                    You can enable or disable features using these flags in{" "}
                    <code>lib/appwrite.ts</code>:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 sm:mt-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="font-mono text-xs">
                        ENABLE_CLOUD_FEATURES
                      </div>
                      <p className="text-xs mt-1">
                        Enable or disable cloud synchronization
                      </p>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Default: true
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="font-mono text-xs">ENABLE_ENCRYPTION</div>
                      <p className="text-xs mt-1">
                        Enable client-side encryption of data
                      </p>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Default: true
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="font-mono text-xs">FORCE_LOCAL_MODE</div>
                      <p className="text-xs mt-1">
                        Force local storage mode only
                      </p>
                      <div className="text-xs mt-1 text-muted-foreground">
                        Default: false
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mt-4 sm:mt-6">
                    Customization Files
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 sm:mt-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <code className="font-mono text-xs">
                        tailwind.config.ts
                      </code>
                      <p className="text-xs mt-1">
                        Colors, fonts, and design tokens
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <code className="font-mono text-xs">app/layout.tsx</code>
                      <p className="text-xs mt-1">Main layout structure</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <code className="font-mono text-xs">components/ui/*</code>
                      <p className="text-xs mt-1">UI component library</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <code className="font-mono text-xs">public/*</code>
                      <p className="text-xs mt-1">Logos and static assets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Troubleshooting Section */}
        <TabsContent value="troubleshooting">
          <div className="grid gap-4 md:gap-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Common Issues & Solutions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Troubleshoot typical problems with Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Authentication Issues
                  </h3>

                  <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                    <h4 className="text-sm sm:text-lg font-semibold">
                      Problem: Unable to log in
                    </h4>
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
                  </div>

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
                          <li>Check Appwrite database directly</li>
                          <li>Avoid private browsing mode</li>
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
                        Docker deployment issues
                      </h4>
                      <div className="mt-2">
                        <p className="font-semibold text-xs">Solutions:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-xs">
                          <li>Check environment variables</li>
                          <li>Review Docker logs for errors</li>
                          <li>Verify Docker network settings</li>
                          <li>Check for port conflicts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <LifeBuoy className="h-4 w-4 sm:h-5 sm:w-5" />
                  Getting Help
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Where to find additional support
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-base">
                    If you're encountering issues not covered in the
                    troubleshooting guide, there are several resources available
                    for getting help:
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
                          </p>
                          <a
                            href="https://github.com/yourusername/grade-tracker-v2/issues"
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 sm:mt-12 lg:mt-16 border-t pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <Link href="/" className="text-primary hover:underline text-sm">
              Return to Dashboard
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <p className="text-muted-foreground">
              Last updated: April 22, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
