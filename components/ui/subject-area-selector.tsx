/**
 * Subject Area Selector Component
 * Allows selecting the subject area to optimize flashcard generation
 */
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Atom, BookOpen, Calculator, Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

export type SubjectArea = 'science' | 'mathematics' | 'humanities' | 'language';

interface SubjectAreaOption {
  value: SubjectArea;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const subjectOptions: SubjectAreaOption[] = [
  {
    value: "science",
    label: "Science",
    description: "Biology, Chemistry, Physics, Environmental Science, etc.",
    icon: <Atom className="h-4 w-4 mr-2" />
  },
  {
    value: "mathematics",
    label: "Mathematics",
    description: "Algebra, Calculus, Statistics, Geometry, etc.",
    icon: <Calculator className="h-4 w-4 mr-2" />
  },
  {
    value: "humanities",
    label: "Humanities",
    description: "History, Literature, Philosophy, Arts, etc.",
    icon: <BookOpen className="h-4 w-4 mr-2" />
  },
  {
    value: "language",
    label: "Language",
    description: "Foreign Languages, Linguistics, Grammar, etc.",
    icon: <Globe className="h-4 w-4 mr-2" />
  }
];

interface SubjectAreaSelectorProps {
  value: SubjectArea | undefined;
  onChange: (value: SubjectArea | undefined) => void;
  disabled?: boolean;
}

export function SubjectAreaSelector({ value, onChange, disabled = false }: SubjectAreaSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="subject-select">Subject Area</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Select the subject area to help the AI generate more relevant and accurate flashcards</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={value}
        onValueChange={(val) => onChange(val as SubjectArea)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" id="subject-select">
          <SelectValue placeholder="Select subject area (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Subject Areas</SelectLabel>
            {subjectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {option.icon}
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SubjectAreaSelector;