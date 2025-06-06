'use client';

import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_MODELS, DEFAULT_GEMINI_MODEL } from '@/lib/gemini-api-fixed';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}

interface GeminiModelSelectorProps {
  onModelChange?: (modelId: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export function GeminiModelSelector({ 
  onModelChange, 
  defaultValue = DEFAULT_GEMINI_MODEL, 
  disabled = false 
}: GeminiModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<string>(defaultValue);
  
  // Convert available models to a more usable format
  const modelOptions: ModelOption[] = Object.entries(AVAILABLE_MODELS).map(
    ([id, info]: [string, any]) => ({
      id,
      name: info.name,
      description: info.description,
      recommended: !!info.recommended
    })
  );

  // Handle model selection
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    
    if (onModelChange) {
      onModelChange(value);
    }
    
    // Store the preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_gemini_model', value);
    }
  };

  // Load any stored preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedModel = localStorage.getItem('preferred_gemini_model');
      if (storedModel && Object.keys(AVAILABLE_MODELS).includes(storedModel)) {
        setSelectedModel(storedModel);
        if (onModelChange) {
          onModelChange(storedModel);
        }
      }
    }
  }, [onModelChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="model-selector" className="text-sm font-medium">
        Gemini Model
      </Label>
      <Select
        value={selectedModel}
        onValueChange={handleModelChange}
        disabled={disabled}
      >
        <SelectTrigger id="model-selector" className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {modelOptions.map((model) => (
            <SelectItem key={model.id} value={model.id} className="relative">
              <div className="flex items-start gap-2 pr-6">
                <div className="flex-1">
                  <p className="font-medium">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
                {model.recommended && (
                  <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    Recommended
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}