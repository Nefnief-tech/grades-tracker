'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// API Key form schema
const apiKeySchema = z.object({
  apiKey: z.string().min(10, {
    message: "Please enter a valid API key (at least 10 characters).",
  }),
  rememberKey: z.boolean().default(true),
});

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSaveApiKey: (apiKey: string, remember: boolean) => void;
  initialApiKey?: string;
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  title,
  description,
  onSaveApiKey,
  initialApiKey = "",
}: ApiKeyDialogProps) {
  // API Key form handling
  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: initialApiKey,
      rememberKey: true,
    },
  });
  
  const onSubmitApiKey = (values: z.infer<typeof apiKeySchema>) => {
    onSaveApiKey(values.apiKey, values.rememberKey);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...apiKeyForm}>
          <form onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)} className="space-y-4 py-4">
            <FormField
              control={apiKeyForm.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <Input 
                    {...field} 
                    placeholder="Enter your API key" 
                    type="password" 
                    autoComplete="off"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={apiKeyForm.control}
              name="rememberKey"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="remember-key"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="remember-key">
                      Remember my API key (stores in browser cookies)
                    </Label>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save API Key</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}