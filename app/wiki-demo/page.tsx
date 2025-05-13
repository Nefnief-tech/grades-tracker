import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WikiHeading, WikiSection, WikiCallout } from "@/components/ui/wiki-heading";
import { WikiPageLayout, WikiSidebar } from "@/components/ui/wiki-page-layout";
import { WikiTable, WikiTableHeader, WikiTableBody, WikiTableRow, WikiTableHead, WikiTableCell } from "@/components/ui/wiki-table";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ExternalLink, Home, Info, Search } from "lucide-react";
import Link from "next/link";

export default function WikiStyleDemo() {
  return (
    <WikiPageLayout
      title="Wiki-Style UI Components"
      description="An example page showcasing the wiki-styled UI components for Grade Tracker"
      sidebar={
        <WikiSidebar title="Navigation">
          <div className="space-y-2">
            <div className="flex items-center text-[#3366cc] hover:underline">
              <Home size={14} className="mr-2" />
              <Link href="/">Home</Link>
            </div>
            <div className="flex items-center text-[#3366cc] hover:underline">
              <Search size={14} className="mr-2" />
              <Link href="/search">Search</Link>
            </div>
            <div className="flex items-center text-[#3366cc] hover:underline">
              <Info size={14} className="mr-2" />
              <Link href="/about">About</Link>
            </div>
            <Separator className="my-4 bg-[#c8ccd1]" />
            <p className="text-sm text-[#72777d]">Last edited: 2 days ago</p>
          </div>
        </WikiSidebar>
      }
    >
      <WikiSection>
        <WikiHeading level={2}>Introduction</WikiHeading>
        <p className="mb-4">This page demonstrates the wiki-styled UI components for the Grade Tracker application. The design is inspired by popular wiki platforms, featuring clean typography, subtle gradients, and an intuitive layout.</p>
        
        <WikiCallout>
          <div className="flex">
            <Info className="h-5 w-5 mr-2 text-[#3366cc]" />
            <div>
              <strong>Note:</strong> These components maintain the functionality of their original counterparts while adopting a wiki-inspired visual style.
            </div>
          </div>
        </WikiCallout>
      </WikiSection>
      
      <WikiSection>
        <WikiHeading level={2}>Button Examples</WikiHeading>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
          <Button variant="destructive">Delete Button</Button>
        </div>
      </WikiSection>
      
      <WikiSection>
        <WikiHeading level={2}>Card Examples</WikiHeading>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subject Statistics</CardTitle>
              <CardDescription>View your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card contains information about your academic performance.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="flex items-center">
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest grades and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View your most recent activities and grade entries.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="flex items-center">
                See All Activity
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </WikiSection>
      
      <WikiSection>
        <WikiHeading level={2}>Table Example</WikiHeading>
        <WikiTable>
          <WikiTableHeader>
            <WikiTableRow>
              <WikiTableHead>Subject</WikiTableHead>
              <WikiTableHead>Grade</WikiTableHead>
              <WikiTableHead>Date</WikiTableHead>
              <WikiTableHead>Status</WikiTableHead>
            </WikiTableRow>
          </WikiTableHeader>
          <WikiTableBody>
            <WikiTableRow>
              <WikiTableCell>Mathematics</WikiTableCell>
              <WikiTableCell>92%</WikiTableCell>
              <WikiTableCell>2023-04-12</WikiTableCell>
              <WikiTableCell>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Excellent</span>
              </WikiTableCell>
            </WikiTableRow>
            <WikiTableRow>
              <WikiTableCell>Physics</WikiTableCell>
              <WikiTableCell>87%</WikiTableCell>
              <WikiTableCell>2023-04-15</WikiTableCell>
              <WikiTableCell>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Good</span>
              </WikiTableCell>
            </WikiTableRow>
            <WikiTableRow>
              <WikiTableCell>Chemistry</WikiTableCell>
              <WikiTableCell>78%</WikiTableCell>
              <WikiTableCell>2023-04-18</WikiTableCell>
              <WikiTableCell>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs">Average</span>
              </WikiTableCell>
            </WikiTableRow>
          </WikiTableBody>
        </WikiTable>
      </WikiSection>
      
      <WikiSection>
        <WikiHeading level={2}>Typography</WikiHeading>
        <div className="space-y-4">
          <WikiHeading level={1}>Heading Level 1</WikiHeading>
          <WikiHeading level={2}>Heading Level 2</WikiHeading>
          <WikiHeading level={3}>Heading Level 3</WikiHeading>
          <WikiHeading level={4}>Heading Level 4</WikiHeading>
          <WikiHeading level={5}>Heading Level 5</WikiHeading>
          <WikiHeading level={6}>Heading Level 6</WikiHeading>
          
          <p>This is a standard paragraph text. The wiki theme uses clean typography to ensure good readability and a professional look.</p>
          
          <blockquote className="border-l-4 border-[#c8ccd1] pl-4 italic text-[#72777d]">
            This is a blockquote element styled according to wiki conventions.
          </blockquote>
          
          <div>
            <a href="#" className="text-[#3366cc] hover:underline">This is a wiki-styled link</a> that uses the traditional blue color.
          </div>
        </div>
      </WikiSection>
      
      <WikiSection>
        <WikiHeading level={2}>Implementation Notes</WikiHeading>
        <p>To use these wiki-styled components in your application:</p>
        <ol className="list-decimal pl-6 space-y-2 mt-2">
          <li>Import the wiki-theme styles in your global CSS</li>
          <li>Use the WikiPageLayout component as a wrapper for your pages</li>
          <li>Replace standard headings with WikiHeading components</li>
          <li>Use WikiSection for content organization</li>
          <li>Use WikiTable components for data display</li>
        </ol>
      </WikiSection>
      
      <Separator className="my-6 bg-[#c8ccd1]" />
      
      <footer className="text-sm text-[#72777d] flex items-center justify-between">
        <div>Grade Tracker Wiki Theme</div>
        <div className="flex items-center">
          <ExternalLink size={14} className="mr-1" />
          <a href="#" className="text-[#3366cc] hover:underline">Documentation</a>
        </div>
      </footer>
    </WikiPageLayout>
  );
}