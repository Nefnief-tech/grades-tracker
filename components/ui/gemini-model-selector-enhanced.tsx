/**
 * Enhanced Gemini Model Selector Component
 * Allows selecting different Gemini AI model versions with tooltips and descriptions
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
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { GeminiModel } from '@/lib/gemini-service-enhanced';

interface ModelOption {
  value: GeminiModel;
  label: string;
  description: string;
  recommended?: boolean;
}

const modelOptions: ModelOption[] = [
  {
    value: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    description: "Fast generation with good quality. Ideal for simple flashcards and quick responses.",
    recommended: true
  },
  {
    value: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    description: "Higher quality and more nuanced responses. Better for complex subjects and understanding context.",
  },
  {
    value: "gemini-1.5-pro-vision",
    label: "Gemini 1.5 Pro Vision",
    description: "Best for analyzing images and text together. Recommended when uploading images or screenshots."
  }
];

interface GeminiModelSelectorProps {
  value: GeminiModel;
  onChange: (value: GeminiModel) => void;
  disabled?: boolean;
}

export function GeminiModelSelector({ value, onChange, disabled = false }: GeminiModelSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="model-select">AI Model</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Select which Gemini AI model to use for generating flashcards. More advanced models may offer better results but can be slower.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={value}
        onValueChange={(val) => onChange(val as GeminiModel)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" id="model-select">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Gemini 1.5 Models</SelectLabel>
            {modelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span>
                    {option.label}
                    {option.recommended && (
                      <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Recommended</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default GeminiModelSelector;