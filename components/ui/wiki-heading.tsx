import React from 'react';
import { cn } from "@/lib/utils";

interface WikiHeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  withBorder?: boolean;
}

export function WikiHeading({
  children,
  className,
  level = 2,
  withBorder = true,
  ...props
}: WikiHeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Heading = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Heading
      className={cn(
        "font-serif",
        level === 1 && "text-2xl font-medium",
        level === 2 && "text-xl font-medium",
        level === 3 && "text-lg font-medium",
        level === 4 && "text-base font-medium",
        level === 5 && "text-sm font-medium",
        level === 6 && "text-xs font-medium",
        withBorder && "border-b border-[#c8ccd1] pb-1 mb-4",
        className
      )}
      style={{
        fontFamily: "'Linux Libertine', 'Georgia', 'Times', serif",
      }}
      {...props}
    >
      {children}
    </Heading>
  );
}

export function WikiSection({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("my-6", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function WikiCallout({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-[#eaf3ff] border border-[#3366cc] p-4 rounded-md my-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}