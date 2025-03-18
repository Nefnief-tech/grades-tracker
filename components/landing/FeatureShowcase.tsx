import React from "react";
import {
  BookOpen,
  BarChart3, // Updated from BarChart to BarChart3 which is the correct name in lucide-react
  Clock,
  CloudSync,
  Shield,
  Moon,
  Smartphone, // Changed from DeviceMobile to Smartphone which is the correct name
  LucideIcon,
  CircleCheck,
} from "lucide-react";

// Define a type for our feature
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
}

// Create features array with proper typing
const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Subject Organization",
    description:
      "Create and organize academic subjects in a clean, structured interface",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Grade Visualization",
    description:
      "View your progress over time with interactive charts and statistics",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Clock,
    title: "Weighted Grades",
    description:
      "Track different grade types with appropriate weighting for accurate calculation",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CloudSync,
    title: "Optional Sync",
    description:
      "Use locally or enable cloud sync to access grades across devices",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Shield,
    title: "Privacy Protection",
    description:
      "End-to-end encryption ensures your academic data remains private",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Moon,
    title: "Light & Dark Modes",
    description: "Comfortable viewing experience in any lighting environment",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Smartphone,
    title: "Device Compatibility",
    description: "Access your grades on desktop, tablet, or mobile devices",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="container mx-auto px-4 py-20 md:py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Application Features
        </h2>
        <p className="text-lg text-muted-foreground">
          Grade Tracker provides tools to help students monitor academic
          performance accurately
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          // Use the icon directly with fallback to CircleCheck if undefined
          const Icon = feature.icon || CircleCheck;

          return (
            <div
              key={index}
              className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 group"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 ${feature.bg} rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div
                className={`p-3 rounded-lg ${feature.bg} ${feature.color} inline-block mb-4`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
