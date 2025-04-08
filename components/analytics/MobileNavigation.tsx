import { BarChart2, LineChart, PieChart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function MobileNavigation({
  activeSection,
  setActiveSection,
}: MobileNavigationProps) {
  const items = [
    {
      name: "Overview",
      value: "overview",
      icon: LayoutDashboard,
    },
    {
      name: "Subjects",
      value: "subjects",
      icon: BarChart2,
    },
    {
      name: "Trends",
      value: "trends",
      icon: LineChart,
    },
    {
      name: "Distribution",
      value: "dist",
      icon: PieChart,
    },
  ];

  return (
    <div className="flex items-center justify-around py-2 px-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => setActiveSection(item.value)}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors",
            activeSection === item.value
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs mt-1">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
