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
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Book className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Grade Tracker Wiki</h1>
        </div>
        <p className="text-lg text-muted-foreground mt-2">
          Everything you need to know about deploying, using, and customizing
          the Grade Tracker app.
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="mt-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl mb-8">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="user-guide">User Guide</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {/* Getting Started Section */}
        <TabsContent value="getting-started">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About Grade Tracker
                </CardTitle>
                <CardDescription>
                  Learn what Grade Tracker is and how it can help students
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                  <h3 className="text-xl font-bold">What is Grade Tracker?</h3>
                  <p>
                    Grade Tracker is a comprehensive academic performance
                    tracking application designed for students to monitor their
                    grades, track assignments, plan their schedules, and
                    visualize their academic progress.
                  </p>

                  <h3 className="text-xl font-bold mt-6">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2">
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

                  <h3 className="text-xl font-bold mt-6">Technical Overview</h3>
                  <p>
                    Grade Tracker is built using Next.js with React, TypeScript,
                    and Tailwind CSS for the frontend. Data can be stored
                    locally in the browser or synchronized with an Appwrite
                    backend for cloud storage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Quick Start for Developers
                </CardTitle>
                <CardDescription>
                  Get the application up and running in development mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Prerequisites</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Node.js (v16.14.0 or higher)</li>
                    <li>npm, pnpm, or yarn package manager</li>
                    <li>Git (for cloning the repository)</li>
                  </ul>

                  <h3 className="text-xl font-bold mt-6">Installation Steps</h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <p className="font-semibold">Clone the repository:</p>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
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
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code>cd grade-tracker-v2</code>
                      </pre>
                    </li>
                    <li>
                      <p className="font-semibold">Install dependencies:</p>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
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
                      <p>
                        Create a <code>.env.local</code> file in the project
                        root with the following variables:
                      </p>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
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
                    </li>
                    <li>
                      <p className="font-semibold">
                        Start the development server:
                      </p>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code>npm run dev</code>
                        <br />
                        <span className="text-muted-foreground"># or</span>
                        <br />
                        <code>pnpm dev</code>
                      </pre>
                    </li>
                  </ol>

                  <p className="mt-4">
                    The application will be available at{" "}
                    <code>http://localhost:3000</code>. If you need to run the
                    app in local-only mode without Appwrite, you can use:
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                    <code>npm run local-mode</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deployment Section */}
        <TabsContent value="deployment">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Web Deployment Options
                </CardTitle>
                <CardDescription>
                  How to deploy Grade Tracker to various platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Deploying to Vercel</h3>
                    <p className="mt-2">
                      Vercel offers the simplest deployment experience for
                      Next.js applications.
                    </p>
                    <ol className="list-decimal pl-6 space-y-3 mt-4">
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
                        <ul className="list-disc pl-6">
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

                  <div className="mt-8">
                    <h3 className="text-xl font-bold">Deploying with Docker</h3>
                    <p className="mt-2">
                      The project includes Docker configuration for
                      containerized deployments.
                    </p>
                    <ol className="list-decimal pl-6 space-y-3 mt-4">
                      <li>
                        <p className="font-semibold">Build the Docker image:</p>
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                          <code>docker build -t grade-tracker:latest .</code>
                        </pre>
                      </li>
                      <li>
                        <p className="font-semibold">
                          Run the Docker container:
                        </p>
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto">
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
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                          <code>./docker-build-skip-check.sh</code>
                          <br />
                          <span className="text-muted-foreground">
                            # or for Windows
                          </span>
                          <br />
                          <code>docker-build-skip-check.bat</code>
                        </pre>
                      </li>
                      <li>
                        <p className="font-semibold">Publish to Docker Hub:</p>
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                          <code>./docker-hub-publish.sh</code>
                          <br />
                          <span className="text-muted-foreground">
                            # or for Windows
                          </span>
                          <br />
                          <code>docker-hub-publish.bat</code>
                        </pre>
                      </li>
                    </ol>
                    <p className="mt-4">
                      For detailed Docker deployment instructions, refer to the{" "}
                      <code>docker-build-instructions.md</code> file.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold">Deploying to Railway</h3>
                    <p className="mt-2">
                      Railway offers an easy way to deploy containerized
                      applications.
                    </p>
                    <ol className="list-decimal pl-6 space-y-3 mt-4">
                      <li>
                        Create an account on{" "}
                        <a
                          href="https://railway.app"
                          className="text-primary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Railway
                        </a>
                      </li>
                      <li>Connect your GitHub repository</li>
                      <li>Add the necessary environment variables</li>
                      <li>
                        Deploy using the <code>railway.toml</code> configuration
                      </li>
                    </ol>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold">Deploying to Fly.io</h3>
                    <p className="mt-2">
                      Fly.io is another option for deploying containerized
                      applications.
                    </p>
                    <ol className="list-decimal pl-6 space-y-3 mt-4">
                      <li>Install the Fly CLI</li>
                      <li>
                        Authenticate with <code>fly auth login</code>
                      </li>
                      <li>
                        Deploy using <code>fly launch</code> which will use the
                        included <code>fly.toml</code> configuration
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Appwrite Setup Guide
                </CardTitle>
                <CardDescription>
                  Configure the Appwrite backend for cloud synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Appwrite Installation</h3>
                  <p>
                    Grade Tracker uses Appwrite as its backend service for user
                    authentication and data storage. You can either use the
                    Appwrite Cloud service or self-host Appwrite on your own
                    infrastructure.
                  </p>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">
                      Option 1: Appwrite Cloud
                    </h4>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
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
                        Get your API endpoint and project ID from the dashboard
                      </li>
                    </ol>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">
                      Option 2: Self-hosted Appwrite
                    </h4>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
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
                        Deploy Appwrite using the provided Docker Compose setup
                      </li>
                    </ol>
                  </div>

                  <h3 className="text-xl font-bold mt-6">
                    Configuring Appwrite for Grade Tracker
                  </h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <p className="font-semibold">Create a Database:</p>
                      <ul className="list-disc pl-6">
                        <li>Go to Databases in the Appwrite console</li>
                        <li>Create a new database (e.g., "grade-tracker")</li>
                        <li>
                          Note the Database ID for your environment variables
                        </li>
                      </ul>
                    </li>
                    <li>
                      <p className="font-semibold">Create Collections:</p>
                      <p>Create the following collections in your database:</p>
                      <ul className="list-disc pl-6">
                        <li>users</li>
                        <li>subjects</li>
                        <li>grades</li>
                        <li>tests</li>
                        <li>timetableEntries</li>
                      </ul>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Configure Collection Permissions:
                      </p>
                      <p>For each collection, add the following permissions:</p>
                      <ul className="list-disc pl-6">
                        <li>Read: Document (Allow)</li>
                        <li>Create: Document (Allow)</li>
                        <li>Update: Document (Allow)</li>
                        <li>Delete: Document (Allow)</li>
                      </ul>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Create Attributes for Each Collection:
                      </p>
                      <p>
                        Add appropriate attributes for each collection. For
                        example, for the 'subjects' collection:
                      </p>
                      <ul className="list-disc pl-6">
                        <li>userId: String (required)</li>
                        <li>name: String (required)</li>
                        <li>averageGrade: Double</li>
                      </ul>
                    </li>
                    <li>
                      <p className="font-semibold">
                        Enable Email Authentication:
                      </p>
                      <ul className="list-disc pl-6">
                        <li>Go to Auth → Settings → Providers</li>
                        <li>Enable Email/Password authentication</li>
                      </ul>
                    </li>
                    <li>
                      <p className="font-semibold">Configure CORS:</p>
                      <ul className="list-disc pl-6">
                        <li>Go to Project → Settings → Security</li>
                        <li>
                          Add your web application domain to the allowed domains
                          (e.g., http://localhost:3000 for development)
                        </li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Guide Section */}
        <TabsContent value="user-guide">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Using Grade Tracker
                </CardTitle>
                <CardDescription>
                  Learn how to use the main features of Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Getting Started</h3>
                  <ol className="list-decimal pl-6 space-y-3">
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

                  <h3 className="text-xl font-bold mt-8">Feature Guides</h3>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Grade Management</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Add grades to subjects with customizable weights</li>
                      <li>View average grades calculated automatically</li>
                      <li>Edit or delete existing grades</li>
                      <li>Filter grades by type or date range</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Academic Calendar</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>View your class schedule in a calendar format</li>
                      <li>
                        Add one-time or recurring classes to your timetable
                      </li>
                      <li>See upcoming tests and assignments</li>
                      <li>Toggle between day, week, and month views</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Test Tracking</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        Manage upcoming tests with priority levels (high,
                        medium, low)
                      </li>
                      <li>Set reminders for important tests</li>
                      <li>Mark tests as completed when you're done</li>
                      <li>
                        Filter and sort tests by subject, date, or completion
                        status
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Analytics</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        View visual representations of your academic performance
                      </li>
                      <li>Track grade trends over time</li>
                      <li>Compare performance across different subjects</li>
                      <li>
                        Analyze grade distributions to identify areas for
                        improvement
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">
                      Cloud Synchronization
                    </h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        Enable cloud sync in Settings to access your data across
                        devices
                      </li>
                      <li>Toggle sync on/off as needed</li>
                      <li>All data is encrypted to ensure privacy</li>
                      <li>
                        Works offline with automatic sync when connection is
                        restored
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Administrator Guide
                </CardTitle>
                <CardDescription>
                  Managing the Grade Tracker deployment as an administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Administrative Tasks</h3>
                  <p>
                    As an administrator, you'll need to manage the deployment
                    and ensure the application is running correctly.
                  </p>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Monitoring</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Check server logs for errors and issues</li>
                      <li>Monitor Appwrite usage and quotas</li>
                      <li>
                        Set up alerts for API failures or performance issues
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Backups</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Set up regular backups of the Appwrite database</li>
                      <li>Implement disaster recovery procedures</li>
                      <li>Test data restoration periodically</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">User Management</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Manage user accounts through the Appwrite console</li>
                      <li>Handle password resets and account issues</li>
                      <li>Monitor for suspicious account activities</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">
                      Updates and Maintenance
                    </h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        Keep both the frontend and Appwrite backend updated
                      </li>
                      <li>Schedule maintenance windows for updates</li>
                      <li>
                        Communicate changes to users through announcements
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Section */}
        <TabsContent value="configuration">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration Options
                </CardTitle>
                <CardDescription>
                  Customize the Grade Tracker application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Environment Variables</h3>
                  <p>
                    The application can be configured using environment
                    variables. Here's a comprehensive list:
                  </p>

                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Variable
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Default
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_ENDPOINT
                          </td>
                          <td className="px-4 py-3 text-sm">
                            The URL of your Appwrite API endpoint
                          </td>
                          <td className="px-4 py-3 text-sm">
                            https://appwrite.nief.tech/v1
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_PROJECT_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Your Appwrite project ID
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_DATABASE_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Your Appwrite database ID
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Collection ID for users
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Collection ID for subjects
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Collection ID for grades
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Collection ID for tests
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Collection ID for timetable entries
                          </td>
                          <td className="px-4 py-3 text-sm">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_ENABLE_ANALYTICS
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Enable or disable analytics features
                          </td>
                          <td className="px-4 py-3 text-sm">true</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            NEXT_PUBLIC_FORCE_LOCAL_MODE
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Force the application to use local storage only
                          </td>
                          <td className="px-4 py-3 text-sm">false</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-bold mt-8">Feature Flags</h3>
                  <p>
                    You can enable or disable certain features in the code using
                    feature flags. These are primarily located in{" "}
                    <code>lib/appwrite.ts</code>.
                  </p>

                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Flag
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Default
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            ENABLE_CLOUD_FEATURES
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Enable or disable all cloud synchronization features
                          </td>
                          <td className="px-4 py-3 text-sm">true</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            ENABLE_ENCRYPTION
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Enable or disable client-side encryption of data
                          </td>
                          <td className="px-4 py-3 text-sm">true</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">
                            FORCE_LOCAL_MODE
                          </td>
                          <td className="px-4 py-3 text-sm">
                            Forces the application to use local storage only
                          </td>
                          <td className="px-4 py-3 text-sm">false</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-bold mt-8">Customization</h3>
                  <p>
                    You can customize the look and feel of the application by
                    modifying the following files:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>
                      <code>tailwind.config.ts</code>: Customize colors, fonts,
                      and other design tokens
                    </li>
                    <li>
                      <code>app/layout.tsx</code>: Modify the main layout
                      structure
                    </li>
                    <li>
                      <code>components/ui/*</code>: UI component library that
                      can be customized
                    </li>
                    <li>
                      <code>public/*</code>: Replace logos and other static
                      assets
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Troubleshooting Section */}
        <TabsContent value="troubleshooting">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Common Issues & Solutions
                </CardTitle>
                <CardDescription>
                  Troubleshoot typical problems with Grade Tracker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Authentication Issues</h3>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-lg font-semibold">
                      Problem: Unable to log in
                    </h4>
                    <div className="mt-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          Incorrect Appwrite endpoint or project ID
                          configuration
                        </li>
                        <li>Network connectivity problems</li>
                        <li>
                          Email/password authentication not enabled in Appwrite
                        </li>
                      </ul>

                      <p className="font-semibold mt-4">Solutions:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          Verify your Appwrite credentials in environment
                          variables
                        </li>
                        <li>
                          Check browser console for specific error messages
                        </li>
                        <li>
                          Ensure email authentication is enabled in Appwrite
                          console
                        </li>
                        <li>
                          Check CORS settings in Appwrite to allow your domain
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="text-lg font-semibold">
                      Problem: Data not syncing to cloud
                    </h4>
                    <div className="mt-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Network connectivity issues</li>
                        <li>Cloud sync option disabled in user settings</li>
                        <li>
                          Insufficient permissions in Appwrite collections
                        </li>
                        <li>
                          Mismatch between collection IDs in config and Appwrite
                        </li>
                      </ul>

                      <p className="font-semibold mt-4">Solutions:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Check if user has enabled sync in settings</li>
                        <li>Verify network connectivity</li>
                        <li>
                          Confirm collection permissions in Appwrite console
                        </li>
                        <li>
                          Validate collection IDs match between app config and
                          Appwrite
                        </li>
                        <li>Check browser console for API errors</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="text-lg font-semibold">
                      Problem: Data appears to be lost
                    </h4>
                    <div className="mt-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Browser local storage cleared</li>
                        <li>Sync conflicts between devices</li>
                        <li>
                          Browser privacy mode (incognito/private) being used
                        </li>
                      </ul>

                      <p className="font-semibold mt-4">Solutions:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Enable cloud sync and log in to restore data</li>
                        <li>
                          Check if data exists in Appwrite database directly
                        </li>
                        <li>
                          Avoid using the application in private browsing mode
                        </li>
                        <li>
                          Use the "Force refresh from cloud" option in settings
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="text-lg font-semibold">
                      Problem: Application is slow or unresponsive
                    </h4>
                    <div className="mt-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Large amount of data stored locally</li>
                        <li>Network latency when fetching cloud data</li>
                        <li>Browser performance issues</li>
                      </ul>

                      <p className="font-semibold mt-4">Solutions:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          Enable cloud sync to offload data from local storage
                        </li>
                        <li>Archive old subjects that are no longer needed</li>
                        <li>Clear browser cache and reload the application</li>
                        <li>Update to the latest browser version</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="text-lg font-semibold">
                      Problem: Docker deployment issues
                    </h4>
                    <div className="mt-2">
                      <p className="font-semibold">Possible causes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Missing environment variables in container</li>
                        <li>Network configuration problems</li>
                        <li>Docker build errors</li>
                      </ul>

                      <p className="font-semibold mt-4">Solutions:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>
                          Ensure all environment variables are properly passed
                          to container
                        </li>
                        <li>Check Docker logs for specific error messages</li>
                        <li>Verify Docker network settings</li>
                        <li>Check for port conflicts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5" />
                  Getting Help
                </CardTitle>
                <CardDescription>
                  Where to find additional support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    If you're encountering issues not covered in the
                    troubleshooting guide, there are several resources available
                    for getting help:
                  </p>

                  <div className="grid gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Github className="h-5 w-5 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold">GitHub Issues</h4>
                        <p className="text-sm text-muted-foreground">
                          Report bugs or request features by creating an issue
                          on the GitHub repository.
                        </p>
                        <Button
                          variant="link"
                          className="pl-0 h-auto mt-1"
                          asChild
                        >
                          <a
                            href="https://github.com/yourusername/grade-tracker-v2/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open an issue on GitHub
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold">Documentation</h4>
                        <p className="text-sm text-muted-foreground">
                          Review the documentation files in the project
                          repository for detailed information.
                        </p>
                        <Button
                          variant="link"
                          className="pl-0 h-auto mt-1"
                          asChild
                        >
                          <a
                            href="/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Browse documentation
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <HardDrive className="h-5 w-5 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold">
                          Appwrite Documentation
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          For Appwrite-specific issues, refer to their
                          comprehensive documentation.
                        </p>
                        <Button
                          variant="link"
                          className="pl-0 h-auto mt-1"
                          asChild
                        >
                          <a
                            href="https://appwrite.io/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Appwrite Documentation
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg mt-6">
                    <h4 className="text-lg font-semibold">
                      Need to contact an administrator?
                    </h4>
                    <p className="mt-2">
                      If you've deployed this application for an organization
                      and users need assistance, consider adding contact
                      information here for your organization's support team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 border-t pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Home className="h-5 w-5" />
            <Link href="/" className="text-primary hover:underline">
              Return to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <p className="text-sm text-muted-foreground">
              Last updated: April 22, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
