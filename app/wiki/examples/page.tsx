"use client";

import React from "react";
import Link from "next/link";
import { 
  AlertCircle, 
  Book, 
  BookText, 
  Calendar,
  CheckCircle2, 
  Code, 
  Download, 
  File, 
  Flame, 
  GitFork,
  GitPullRequest,
  HelpCircle, 
  Home,
  Info, 
  Layers,
  LineChart, 
  Server, 
  Settings, 
  Star, 
  Table,
  Users 
} from "lucide-react";
import { WikiHero } from "@/components/wiki/WikiHero";
import { WikiCard } from "@/components/wiki/WikiCard";
import { WikiFeatureCard } from "@/components/wiki/WikiFeatureCard";
import { WikiCodeBlock } from "@/components/wiki/WikiCodeBlock";
import { WikiAlert } from "@/components/wiki/WikiAlert";
import { WikiBadge } from "@/components/wiki/WikiBadge";
import { WikiTable } from "@/components/wiki/WikiTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WikiNavigation } from "@/components/wiki/WikiNavigation";
import { Card } from "@/components/ui/card";
import { WikiAccordion, WikiAccordionItem } from "@/components/wiki/WikiAccordion";
import { WikiCallout } from "@/components/wiki/WikiCallout";
import { WikiComparisonTable } from "@/components/wiki/WikiComparisonTable";
import { WikiTimeline } from "@/components/wiki/WikiTimeline";
import { WikiTabs } from "@/components/wiki/WikiTabs";

export default function WikiExamplesPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-6xl">
      <WikiHero
        title="Wiki Component Examples"
        description="Showcase of the modern wiki components available in Grade Tracker"
        icon={<Code className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />}
        badges={
          <>
            <WikiBadge>React Components</WikiBadge>
            <WikiBadge variant="secondary">Modern Design</WikiBadge>
            <WikiBadge variant="accent">Responsive UI</WikiBadge>
          </>
        }
      />

      <Tabs defaultValue="components" className="mt-4 sm:mt-6">
        <WikiNavigation
          items={[
            { value: "components", label: "Components", icon: <Code /> },
            { value: "alerts", label: "Alerts", icon: <AlertCircle /> },
            { value: "advanced", label: "Advanced", icon: <Layers /> },
            { value: "code", label: "Code Blocks", icon: <Code /> },
            { value: "tables", label: "Tables", icon: <Table /> },
          ]}
        />

        <TabsContent value="components">
          <div className="grid gap-4 md:gap-6">
            <WikiCard
              icon={<Info className="h-5 w-5" />}
              title="WikiHero Component"
              description="A hero section with gradient background, animations, and support for badges"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiHero component is used at the top of wiki pages to provide a
                  visually appealing introduction with animations and gradient backgrounds.
                </p>

                <div className="p-4 border rounded-md bg-muted/20">
                  <h3 className="text-sm font-medium mb-2">Example Usage:</h3>
                  <WikiCodeBlock
                    code={`<WikiHero
  title="Grade Tracker Wiki"
  description="Everything you need to know about the app"
  icon={<Book className="h-12 w-12 text-primary" />}
  badges={
    <>
      <WikiBadge>React & Next.js</WikiBadge>
      <WikiBadge variant="secondary">Appwrite Backend</WikiBadge>
      <WikiBadge variant="accent">Responsive Design</WikiBadge>
    </>
  }
/>`}
                    language="typescript"
                    showLineNumbers
                  />
                </div>
              </div>
            </WikiCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WikiCard
                icon={<BookText className="h-5 w-5" />}
                title="WikiCard Component"
                description="Card component with icon header and consistent spacing"
                delay={0.1}
              >
                <div className="space-y-4">
                  <p className="text-sm">
                    The WikiCard component is the standard content container for wiki pages.
                    It includes an icon, title, optional description, and animated entrance.
                  </p>
                </div>
              </WikiCard>

              <WikiCard
                icon={<Star className="h-5 w-5" />}
                title="WikiFeatureCard Component"
                description="Compact cards for highlighting features"
                delay={0.2}
              >
                <div className="space-y-4">
                  <p className="text-sm mb-4">
                    Feature cards are used to highlight key features or benefits in a compact format.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <WikiFeatureCard
                      icon={<LineChart className="h-4 w-4" />}
                      title="Analytics"
                      description="Track progress with visual reports"
                      delay={0.3}
                    />
                    <WikiFeatureCard
                      icon={<Calendar className="h-4 w-4" />}
                      title="Scheduling"
                      description="Plan your academic calendar"
                      delay={0.4}
                    />
                  </div>
                </div>
              </WikiCard>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <span className="bg-primary/10 p-1.5 rounded text-primary">
                    <WikiBadge>Default Badge</WikiBadge>
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Primary badge style for tags and categories
                </p>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <span className="bg-secondary/10 p-1.5 rounded text-secondary">
                    <WikiBadge variant="secondary">Secondary Badge</WikiBadge>
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Alternative style for secondary information
                </p>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <span className="bg-accent/10 p-1.5 rounded text-accent">
                    <WikiBadge variant="accent">Accent Badge</WikiBadge>
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Highlight important categories or features
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid gap-4">
            <WikiCard
              icon={<AlertCircle className="h-5 w-5" />}
              title="Alert Components"
              description="Different types of alerts for user notifications"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiAlert component comes in four variants to convey different 
                  types of information to users.
                </p>

                <div className="grid gap-3">
                  <WikiAlert title="Information" variant="info">
                    This is an information alert. Use it to provide helpful context or additional details about a topic.
                  </WikiAlert>
                  
                  <WikiAlert title="Success" variant="success">
                    This is a success alert. Use it to confirm that an action was completed successfully.
                  </WikiAlert>
                  
                  <WikiAlert title="Warning" variant="warning">
                    This is a warning alert. Use it to warn users about potential issues or required attention.
                  </WikiAlert>
                  
                  <WikiAlert title="Danger" variant="danger">
                    This is a danger alert. Use it to highlight critical errors or issues that need immediate attention.
                  </WikiAlert>
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h3 className="text-sm font-medium mb-2">Example Usage:</h3>
                  <WikiCodeBlock
                    code={`<WikiAlert title="Warning" variant="warning">
  Make sure to set up your environment variables correctly.
</WikiAlert>`}
                    language="typescript"
                  />
                </div>
              </div>
            </WikiCard>

            <WikiCard
              icon={<Flame className="h-5 w-5" />}
              title="Callout Components"
              description="Gradient-styled callouts for important information"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiCallout component provides visually distinct sections with 
                  gradient backgrounds to highlight important information.
                </p>

                <div className="grid gap-3">
                  <WikiCallout title="Pro Tip" type="tip">
                    You can use keyboard shortcuts to navigate quickly through the application.
                    Press <strong>?</strong> to see all available shortcuts.
                  </WikiCallout>
                  
                  <WikiCallout title="Important Note" type="note">
                    All grades are automatically saved to the cloud when you're logged in.
                    Make sure to sync before logging out if you've made changes while offline.
                  </WikiCallout>
                  
                  <WikiCallout title="Caution" type="warning">
                    Deleting a subject will remove all associated grades and cannot be undone.
                    Make sure to backup your data before performing this action.
                  </WikiCallout>
                  
                  <WikiCallout title="Key Concept" type="important">
                    Grade weighting is calculated based on the importance factor assigned to each
                    grade entry. Higher weights contribute more to the overall average.
                  </WikiCallout>
                </div>
              </div>
            </WikiCard>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid gap-4">
            <WikiCard
              icon={<Layers className="h-5 w-5" />}
              title="Advanced Components"
              description="More complex UI components for rich content experiences"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-2">WikiAccordion Component</h3>
                  <p className="text-sm mb-3">
                    Use accordions to organize content in expandable sections, helping 
                    to manage complex information in a more digestible format.
                  </p>
                  
                  <WikiAccordion className="mb-6">
                    <WikiAccordionItem
                      title="Getting Started"
                      icon={<Info className="h-4 w-4" />}
                      defaultOpen
                    >
                      <p>
                        To start using Grade Tracker, first create an account or use local mode.
                        Then add your subjects and begin tracking your academic performance.
                      </p>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem
                      title="Managing Subjects"
                      icon={<Book className="h-4 w-4" />}
                    >
                      <p>
                        Add, edit, and delete subjects from the Subjects page. You can customize
                        the color, icon, and grading scheme for each subject.
                      </p>
                    </WikiAccordionItem>
                    
                    <WikiAccordionItem
                      title="Grade Calculation"
                      icon={<Calculate className="h-4 w-4" />}
                    >
                      <div className="space-y-2">
                        <p>
                          Grades are calculated using weighted averages. Each grade entry can have
                          a different weight to reflect its importance.
                        </p>
                        
                        <WikiCodeBlock
                          code={`// Grade calculation formula
weightedAverage = 
  Σ(grade.value * grade.weight) / Σ(grade.weight)`}
                          language="typescript"
                        />
                      </div>
                    </WikiAccordionItem>
                  </WikiAccordion>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-2">WikiTimeline Component</h3>
                  <p className="text-sm mb-3">
                    Use timelines to display sequential information, processes, or historical events.
                  </p>
                  
                  <WikiTimeline 
                    items={[
                      {
                        title: "Initial Setup",
                        description: "Create an account and set up your profile",
                        status: "completed",
                        date: "Day 1"
                      },
                      {
                        title: "Add Subjects",
                        description: "Create your first academic subjects",
                        status: "completed",
                        date: "Day 1"
                      },
                      {
                        title: "Enter Grades",
                        description: "Record your existing grades for each subject",
                        status: "current",
                        date: "Day 2"
                      },
                      {
                        title: "Set Up Schedule",
                        description: "Add your classes to the weekly calendar",
                        status: "upcoming",
                        date: "Day 3"
                      },
                      {
                        title: "Configure Notifications",
                        description: "Set up reminders for upcoming tests and assignments",
                        status: "upcoming",
                        date: "Day 4"
                      }
                    ]}
                    className="mb-6"
                  />
                </div>

                <div>
                  <h3 className="text-base font-medium mb-2">WikiTabs Component</h3>
                  <p className="text-sm mb-3">
                    Custom tab variants with smooth animations and different styling options.
                  </p>
                  
                  <div className="space-y-8">
                    <WikiTabs
                      variant="pills"
                      tabs={[
                        {
                          id: "installation",
                          label: "Installation",
                          icon: <Download className="h-4 w-4" />,
                          children: (
                            <div className="p-4 bg-muted/20 rounded-lg">
                              <h4 className="font-medium mb-2">Install with npm</h4>
                              <WikiCodeBlock
                                code="npm install grade-tracker"
                                language="bash"
                              />
                            </div>
                          ),
                        },
                        {
                          id: "configuration",
                          label: "Configuration",
                          icon: <Settings className="h-4 w-4" />,
                          children: (
                            <div className="p-4 bg-muted/20 rounded-lg">
                              <h4 className="font-medium mb-2">Basic Configuration</h4>
                              <WikiCodeBlock
                                code={`// config.js
export default {
  theme: 'light',
  syncEnabled: true,
  analyticsEnabled: false,
}`}
                                language="javascript"
                              />
                            </div>
                          ),
                        },
                        {
                          id: "usage",
                          label: "Usage",
                          icon: <File className="h-4 w-4" />,
                          children: (
                            <div className="p-4 bg-muted/20 rounded-lg">
                              <h4 className="font-medium mb-2">Basic Usage</h4>
                              <WikiCodeBlock
                                code={`import { GradeTracker } from 'grade-tracker';

// Initialize the application
const app = new GradeTracker({
  container: '#app',
  userId: 'user-123',
});

// Start the application
app.start();`}
                                language="javascript"
                              />
                            </div>
                          ),
                        },
                      ]}
                    />
                    
                    <WikiTabs
                      variant="underlined"
                      tabs={[
                        {
                          id: "local",
                          label: "Local Storage",
                          children: (
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Using Local Storage</h4>
                              <p className="text-sm">
                                Local storage mode keeps all your data in the browser.
                                This is perfect for users who prefer offline usage or
                                don't want to create an account.
                              </p>
                            </div>
                          ),
                        },
                        {
                          id: "cloud",
                          label: "Cloud Sync",
                          children: (
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2">Using Cloud Sync</h4>
                              <p className="text-sm">
                                Cloud synchronization keeps your data backed up and
                                available across all your devices. Simply sign in with
                                your account to enable this feature.
                              </p>
                            </div>
                          ),
                        },
                      ]}
                    />
                    
                    <WikiTabs
                      variant="cards"
                      tabs={[
                        {
                          id: "beginner",
                          label: "Beginner",
                          icon: <Users className="h-4 w-4" />,
                          children: (
                            <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg">
                              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                                Beginner Features
                              </h4>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Basic grade tracking</li>
                                <li>Simple subject management</li>
                                <li>Grade average calculation</li>
                              </ul>
                            </div>
                          ),
                        },
                        {
                          id: "intermediate",
                          label: "Intermediate",
                          icon: <GitFork className="h-4 w-4" />,
                          children: (
                            <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                                Intermediate Features
                              </h4>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Grade weighting options</li>
                                <li>Data visualization</li>
                                <li>Test schedule management</li>
                                <li>Cloud synchronization</li>
                              </ul>
                            </div>
                          ),
                        },
                        {
                          id: "advanced",
                          label: "Advanced",
                          icon: <GitPullRequest className="h-4 w-4" />,
                          children: (
                            <div className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                              <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">
                                Advanced Features
                              </h4>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Grade prediction algorithms</li>
                                <li>Academic performance analytics</li>
                                <li>Custom grading schemes</li>
                                <li>API integration capabilities</li>
                                <li>Data export and reporting</li>
                              </ul>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </WikiCard>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="grid gap-4">
            <WikiCard
              icon={<Code className="h-5 w-5" />}
              title="Code Block Components"
              description="Syntax highlighted code with copy functionality"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiCodeBlock component displays code snippets with syntax highlighting, 
                  line numbers (optional), and a copy button that appears on hover.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">TypeScript Example:</h3>
                    <WikiCodeBlock
                      code={`// A TypeScript function example
function calculateGrade(scores: number[]): string {
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  return 'F';
}`}
                      language="typescript"
                      showLineNumbers
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">JSON Example:</h3>
                    <WikiCodeBlock
                      code={`{
  "name": "grade-tracker",
  "version": "2.0.0",
  "private": true,
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "appwrite": "^13.0.0"
  }
}`}
                      language="json"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Command Line Example:</h3>
                    <WikiCodeBlock
                      code={`# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build`}
                      language="bash"
                    />
                  </div>
                </div>
              </div>
            </WikiCard>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="grid gap-4">
            <WikiCard
              icon={<Table className="h-5 w-5" />}
              title="Table Components"
              description="Responsive tables for structured data"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiTable component displays structured data in a responsive table format 
                  with optional captions and compact mode.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Standard Table:</h3>
                    <WikiTable
                      headers={["Function", "Description", "Return Type"]}
                      rows={[
                        ["calculateAverage(scores)", "Calculates the average of an array of scores", "number"],
                        ["getLetterGrade(score)", "Converts a numeric score to a letter grade", "string"],
                        ["isPassingGrade(grade)", "Checks if a grade is passing (C or better)", "boolean"]
                      ]}
                      caption="Grade Tracker API Functions"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Compact Table:</h3>
                    <WikiTable
                      headers={["Environment Variable", "Default Value", "Required"]}
                      rows={[
                        ["NEXT_PUBLIC_APPWRITE_ENDPOINT", "-", "Yes"],
                        ["NEXT_PUBLIC_APPWRITE_PROJECT_ID", "-", "Yes"],
                        ["NEXT_PUBLIC_APPWRITE_DATABASE_ID", "-", "Yes"],
                        ["NEXT_PUBLIC_MAINTENANCE_MODE", "false", "No"],
                        ["NEXT_PUBLIC_ANALYTICS_ENABLED", "true", "No"]
                      ]}
                      compact
                    />
                  </div>
                </div>
              </div>
            </WikiCard>

            <WikiCard
              icon={<GitFork className="h-5 w-5" />}
              title="Comparison Table"
              description="Feature comparison tables for comparing options"
            >
              <div className="space-y-4">
                <p className="text-sm">
                  The WikiComparisonTable component allows you to compare features across 
                  different options or plans.
                </p>

                <WikiComparisonTable
                  options={["Free Plan", "Basic Plan", "Premium Plan"]}
                  features={[
                    {
                      feature: "Number of Subjects",
                      description: "Maximum subjects you can track",
                      options: {
                        "Free Plan": "5 subjects",
                        "Basic Plan": "15 subjects",
                        "Premium Plan": "Unlimited"
                      }
                    },
                    {
                      feature: "Cloud Sync",
                      description: "Synchronize data across devices",
                      options: {
                        "Free Plan": false,
                        "Basic Plan": true,
                        "Premium Plan": true
                      }
                    },
                    {
                      feature: "Analytics",
                      description: "Advanced grade analytics and reporting",
                      options: {
                        "Free Plan": false,
                        "Basic Plan": false,
                        "Premium Plan": true
                      }
                    },
                    {
                      feature: "Data Export",
                      description: "Export grades and reports",
                      options: {
                        "Free Plan": false,
                        "Basic Plan": "CSV format only",
                        "Premium Plan": "CSV, PDF, Excel"
                      }
                    },
                    {
                      feature: "API Access",
                      description: "Access to the Grade Tracker API",
                      options: {
                        "Free Plan": false,
                        "Basic Plan": false,
                        "Premium Plan": true
                      }
                    }
                  ]}
                  highlightColumn={2}
                  caption="Plan Comparison"
                />
              </div>
            </WikiCard>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t pt-4">
        <div className="flex items-center justify-between">
          <Link href="/wiki" className="inline-flex items-center text-primary hover:underline">
            <Home className="mr-1 h-4 w-4" /> Back to Wiki
          </Link>
          
          <Button variant="outline" asChild>
            <Link href="/wiki">Exit Examples</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Calculate(props: any) {
  // This is a placeholder component
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M9 9h6" />
      <path d="M12 6v6" />
      <path d="M9 18h6" />
    </svg>
  );
}