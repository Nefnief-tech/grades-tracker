/**
 * Gemini 2.0 Model Selector Component
 * Allows selecting between different Gemini 2.0 models
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
import { HelpCircle, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gemini2Model } from '@/lib/gemini2-service';

interface ModelOption {
  value: Gemini2Model;
  label: string;
  description: string;
  new?: boolean;
  recommended?: boolean;
}

const modelOptions: ModelOption[] = [
  {
    value: "gemini-2.0-pro",
    label: "Gemini 2.0 Pro",
    description: "Powerful general purpose model with excellent quality. Ideal for most flashcard generation.",
    recommended: true
  },
  {
    value: "gemini-2.0-pro-vision",
    label: "Gemini 2.0 Pro Vision",
    description: "Optimized for analyzing images and text together. Recommended when uploading images or screenshots."
  },
  {
    value: "gemini-2.0-ultra",
    label: "Gemini 2.0 Ultra",
    description: "Highest quality model with superior understanding and reasoning. Best for complex academic content.",
    new: true
  }
];

interface Gemini2ModelSelectorProps {
  value: Gemini2Model;
  onChange: (value: Gemini2Model) => void;
  disabled?: boolean;
}

export function Gemini2ModelSelector({ value, onChange, disabled = false }: Gemini2ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="model-select" className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Gemini 2.0 Model
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Select which Gemini 2.0 AI model to use for generating flashcards. More advanced models offer better results but may require special access or higher quotas.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={value}
        onValueChange={(val) => onChange(val as Gemini2Model)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" id="model-select">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Gemini 2.0 Models</SelectLabel>
            {modelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    {option.label}
                    {option.new && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        New
                      </Badge>
                    )}
                    {option.recommended && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                        Recommended
                      </Badge>
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

export default Gemini2ModelSelector;