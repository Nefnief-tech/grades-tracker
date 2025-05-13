import React from 'react';
import { cn } from "@/lib/utils";
import { WikiHeading } from './wiki-heading';

interface WikiPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  sidebar?: React.ReactNode;
}

export function WikiPageLayout({
  children,
  title,
  description,
  className,
  sidebar,
  ...props
}: WikiPageLayoutProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-8">
      {/* Wiki-style header section */}
      <div className="bg-gradient-to-b from-white to-[#f8f9fa] border-b border-[#c8ccd1] mb-6">
        <div className="container mx-auto px-4 py-6">
          {title && <WikiHeading level={1} withBorder={false}>{title}</WikiHeading>}
          {description && <p className="text-[#72777d] mt-2">{description}</p>}
        </div>
      </div>
      
      {/* Page content with optional sidebar */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          {/* Main content area */}
          <div className={cn("flex-1", className)} {...props}>
            <div className="bg-white border border-[#c8ccd1] rounded-md shadow-sm p-6">
              {children}
            </div>
          </div>
          
          {/* Optional sidebar */}
          {sidebar && (
            <div className="w-full lg:w-64 mt-6 lg:mt-0 lg:ml-6">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WikiSidebar({
  children,
  title,
  className,
  ...props
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-gradient-to-b from-[#f8f9fa] to-[#eaecf0] border border-[#c8ccd1] rounded-md shadow-sm p-4",
        className
      )}
      {...props}
    >
      {title && <WikiHeading level={3} withBorder={true}>{title}</WikiHeading>}
      {children}
    </div>
  );
}