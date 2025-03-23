import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Palette } from "lucide-react";

// Predefined colors for subjects
export const SUBJECT_COLORS = [
  "#4f46e5", // indigo
  "#2563eb", // blue
  "#0284c7", // sky
  "#0891b2", // cyan
  "#0d9488", // teal
  "#059669", // emerald
  "#16a34a", // green
  "#65a30d", // lime
  "#ca8a04", // yellow
  "#d97706", // amber
  "#ea580c", // orange
  "#dc2626", // red
  "#e11d48", // rose
  "#db2777", // pink
  "#9333ea", // purple
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-8 px-2"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color || SUBJECT_COLORS[0] }}
          ></div>
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Subject Color</h4>
          <div className="grid grid-cols-5 gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
              >
                {c === color && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
