/**
 * Enhanced Gemini API Key Validator Component
 * Allows users to input and validate their Gemini API key
 */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Key } from 'lucide-react';
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GeminiKeyValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationResult: (isValid: boolean | null) => void;
}

export function GeminiKeyValidator({ value, onChange, onValidationResult }: GeminiKeyValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | 'pending' | null>(
    value ? 'pending' : null
  );

  // Validate API key on component mount if a key exists
  useEffect(() => {
    if (value && validationStatus === 'pending') {
      validateApiKey();
    }
  }, []);

  // Handle API key validation
  const validateApiKey = async () => {
    if (!value.trim()) {
      setValidationStatus(null);
      setValidationMessage(null);
      onValidationResult(null);
      return;
    }

    setIsValidating(true);
    setValidationStatus('pending');
    setValidationMessage(null);

    try {
      // Make a simple request to check if the API key works
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${value.trim()}`
      );
      
      if (response.status === 200) {
        // API key is valid
        setValidationStatus('success');
        setValidationMessage('API key is valid');
        onValidationResult(true);
      } else if (response.status === 403 || response.status === 401) {
        // API key is invalid or unauthorized
        setValidationStatus('error');
        setValidationMessage('Invalid API key. Please check and try again.');
        onValidationResult(false);
      } else {
        // Other API error
        setValidationStatus('error');
        setValidationMessage(`API error (${response.status}). Please try again later.`);
        onValidationResult(false);
      }
    } catch (error) {
      // Network error or other exception
      console.error('Error validating API key:', error);
      setValidationStatus('error');
      setValidationMessage('Failed to validate API key. Check your internet connection.');
      onValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="api-key" className="flex items-center gap-1">
          <Key className="h-4 w-4" />
          Gemini API Key
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                Get Key
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="max-w-xs">
                <p>Get your Gemini API key from:</p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline text-sm break-all"
                >
                  https://aistudio.google.com/app/apikey
                </a>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Input
            id="api-key"
            type={showKey ? "text" : "password"}
            placeholder="Enter your Gemini API key"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (validationStatus) {
                setValidationStatus('pending');
                setValidationMessage(null);
              }
            }}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 text-xs"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? 'Hide' : 'Show'}
          </Button>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={validateApiKey}
          disabled={isValidating || !value.trim()}
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate'
          )}
        </Button>
      </div>

      {validationStatus && (
        <Alert
          variant={validationStatus === 'success' ? 'default' : 'destructive'}
          className={
            validationStatus === 'success'
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300'
              : undefined
          }
        >
          {validationStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{validationMessage}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-muted-foreground">
        Your API key is stored locally and never sent to our servers.
      </p>
    </div>
  );
}

export default GeminiKeyValidator;