# Wiki Components

This directory contains modern, reusable components for the Grade Tracker wiki pages. These components follow consistent design principles to create a cohesive and visually appealing user interface.

## Design Principles

All components follow these key design principles:

- **Modern Hero Section** with gradient backgrounds and animations
- **Improved Navigation** with rounded pill designs and hover effects
- **Card Design** with subtle shadows and consistent spacing
- **Visual Hierarchy** using proper heading sizes and whitespace
- **Color Scheme** with gradients for visual interest
- **Modern Components** with icons for better visualization
- **Responsive Layout** that adapts to all screen sizes
- **Typography Improvements** with consistent text sizing
- **Interactive Elements** with hover states and animations
- **Content Organization** using logical grouping

## Available Components

### Core Components

#### WikiHero

Use for page headers and introduction sections:

```tsx
<WikiHero
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
/>
```

#### WikiCard

Use for content sections:

```tsx
<WikiCard
  icon={<Info className="h-5 w-5" />}
  title="About Grade Tracker"
  description="Learn what Grade Tracker is and how it can help students"
>
  <p>Content goes here...</p>
</WikiCard>
```

#### WikiFeatureCard

Use for highlighting features:

```tsx
<WikiFeatureCard
  icon={<BarChart className="h-4 w-4" />}
  title="Analytics"
  description="View detailed performance reports and track progress over time"
/>
```

#### WikiCodeBlock

Use for code examples:

```tsx
<WikiCodeBlock
  code="npm install grade-tracker"
  language="bash"
  showLineNumbers={false}
/>
```

### Alert Components

#### WikiAlert

Use for notifications and important information:

```tsx
<WikiAlert title="Note" variant="info">
  Make sure to set up your environment variables correctly.
</WikiAlert>
```

#### WikiCallout

Use for highlighted information with gradient backgrounds:

```tsx
<WikiCallout title="Pro Tip" type="tip">
  You can use keyboard shortcuts to navigate quickly.
</WikiCallout>
```

### Navigation Components

#### WikiBadge

Use for tags and labels:

```tsx
<WikiBadge>React & Next.js</WikiBadge>
<WikiBadge variant="secondary">Appwrite Backend</WikiBadge>
<WikiBadge variant="accent">Responsive Design</WikiBadge>
<WikiBadge variant="outline">Coming Soon</WikiBadge>
```

#### WikiNavigation

Use for tab navigation:

```tsx
<Tabs defaultValue="getting-started">
  <WikiNavigation
    items={[
      { value: "getting-started", label: "Getting Started", icon: <Info /> },
      { value: "deployment", label: "Deployment", icon: <Globe /> },
      { value: "user-guide", label: "User Guide", icon: <Book /> },
    ]}
  />
  
  <TabsContent value="getting-started">
    {/* Content here */}
  </TabsContent>
</Tabs>
```

### Data Display Components

#### WikiTable

Use for data display:

```tsx
<WikiTable
  headers={["Name", "Type", "Description"]}
  rows={[
    ["NEXT_PUBLIC_API_URL", "API endpoint for backend services"],
    ["NEXT_PUBLIC_APP_NAME", "Application name used throughout the UI"],
  ]}
  caption="Environment Variables"
/>
```

#### WikiComparisonTable

Use for comparing features or options:

```tsx
<WikiComparisonTable
  options={["Free Plan", "Premium Plan", "Enterprise"]}
  features={[
    {
      feature: "Cloud Sync",
      description: "Synchronize data across devices",
      options: {
        "Free Plan": false,
        "Premium Plan": true,
        "Enterprise": true
      }
    },
    {
      feature: "Storage",
      description: "Available storage space",
      options: {
        "Free Plan": "1 GB",
        "Premium Plan": "50 GB",
        "Enterprise": "Unlimited"
      }
    }
  ]}
  highlightColumn={1}
/>
```

### Interactive Components

#### WikiAccordion

Use for expandable content sections:

```tsx
<WikiAccordion>
  <WikiAccordionItem title="Getting Started" icon={<Info />} defaultOpen>
    This is the expanded content for the first item.
  </WikiAccordionItem>
  <WikiAccordionItem title="Configuration" icon={<Settings />}>
    This is the content for the second item.
  </WikiAccordionItem>
</WikiAccordion>
```

#### WikiTabs

Use for custom tab interfaces with animations:

```tsx
<WikiTabs
  variant="pills" // or "underlined" or "cards"
  tabs={[
    {
      id: "tab1",
      label: "Installation",
      icon: <Download />,
      children: <div>Tab 1 content</div>
    },
    {
      id: "tab2",
      label: "Configuration",
      icon: <Settings />,
      children: <div>Tab 2 content</div>
    }
  ]}
/>
```

#### WikiTimeline

Use for sequential events or steps:

```tsx
<WikiTimeline
  items={[
    {
      title: "Step 1: Installation",
      description: "Install the package from npm",
      status: "completed",
      date: "Day 1"
    },
    {
      title: "Step 2: Configuration",
      description: "Set up your environment",
      status: "current",
      date: "Day 2"
    },
    {
      title: "Step 3: Deployment",
      description: "Deploy to production",
      status: "upcoming",
      date: "Day 3"
    }
  ]}
/>
```

## Usage Guidelines

1. Maintain consistency by using these components throughout wiki pages
2. Follow responsive design patterns with sm/md/lg breakpoints
3. Keep text readable with proper font sizes and line heights
4. Use animations sparingly to avoid overwhelming the user
5. Ensure all components have proper accessibility attributes

## Example Page

For complete examples of all components in action, see the [Wiki Component Examples](/wiki/examples) page.

For more information, see the main wiki page implementation at `/app/wiki/page.tsx`.