'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Key, Save } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, checkGeminiApiKeyCapabilities } from '@/lib/gemini-api-fixed';

interface GeminiKeyValidatorProps {
  onValidationComplete?: (isValid: boolean, models: string[]) => void;
}

export function GeminiKeyValidator({ onValidationComplete }: GeminiKeyValidatorProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [keyInfo, setKeyInfo] = useState<{
    hasAccess: boolean;
    availableModels: string[];
    recommendedModel: string;
  } | null>(null);

  // Load API key on component mount
  useEffect(() => {
    const savedKey = getGeminiApiKey();
    setApiKey(savedKey);
    
    // If we have a saved key, validate it automatically
    if (savedKey) {
      validateKey(savedKey);
    }
  }, []);

  // Save API key
  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    await validateKey(apiKey);
  };

  // Validate API key
  const validateKey = async (key: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      const capabilityInfo = await checkGeminiApiKeyCapabilities(key);
      setKeyInfo(capabilityInfo);
      
      if (capabilityInfo.availableModels.length > 0) {
        // Key is valid, save it
        saveGeminiApiKey(key);
        
        // Determine success message based on model access
        if (capabilityInfo.hasAccess) {
          setSuccess('API key is valid and has access to Gemini 1.5 models');
        } else {
          setSuccess('API key is valid, but does not have access to Gemini 1.5 models');
        }
        
        // Notify parent component
        if (onValidationComplete) {
          onValidationComplete(true, capabilityInfo.availableModels);
        }
      } else {
        setError('API key is invalid or has no access to any Gemini models');
        
        // Notify parent component
        if (onValidationComplete) {
          onValidationComplete(false, []);
        }
      }
    } catch (err) {
      setError('Error validating API key. Please check your key and try again.');
      
      // Notify parent component
      if (onValidationComplete) {
        onValidationComplete(false, []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Gemini API Key
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSaveKey} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Validate & Save
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">
            Don't have a key? <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Get one from Google AI Studio</a>
          </p>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
        
        {/* Key information */}
        {keyInfo && keyInfo.availableModels.length > 0 && (
          <div className="mt-4 border rounded-md p-3">
            <h3 className="text-sm font-medium mb-2">Available Models:</h3>
            <div className="flex flex-wrap gap-2">
              {keyInfo.availableModels.map((model) => (
                <Badge 
                  key={model} 
                  variant={model.includes('1.5') ? "default" : "outline"}
                  className={model === keyInfo.recommendedModel ? "border-green-500" : ""}
                >
                  {model}
                  {model === keyInfo.recommendedModel && (
                    <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
                  )}
                </Badge>
              ))}
            </div>
            
            {!keyInfo.hasAccess && keyInfo.availableModels.length > 0 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Note: For best results with image processing, we recommend upgrading to a Gemini 1.5 API key.
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start pt-0">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert 
            className="w-full bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}