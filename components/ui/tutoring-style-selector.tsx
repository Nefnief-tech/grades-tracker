'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface TutoringStyleOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface TutoringStyleSelectorProps {
  options: TutoringStyleOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function TutoringStyleSelector({ 
  options, 
  defaultValue, 
  onValueChange 
}: TutoringStyleSelectorProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || (options.length > 0 ? options[0].id : ''));
  
  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    
    if (onValueChange) {
      onValueChange(value);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tutoring Style</Label>
      
      <RadioGroup
        value={selectedValue}
        onValueChange={handleValueChange}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        {options.map((option) => (
          <div key={option.id} className="space-y-1">
            <RadioGroupItem
              value={option.id}
              id={`style-${option.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`style-${option.id}`}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3",
                "hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary",
                "cursor-pointer transition-all text-center"
              )}
            >
              {option.icon && <span className="text-2xl mb-1">{option.icon}</span>}
              <span className="text-sm font-medium">{option.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}