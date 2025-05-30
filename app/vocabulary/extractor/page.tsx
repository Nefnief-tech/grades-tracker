'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/app/components/shared/FileUpload";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { BarChart, Image, FileText, Key, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import NewVocabularyDisplay from '../NewVocabularyDisplay';
import { ApiKeyDialog } from '@/app/components/shared/ApiKeyDialog';
import { ApiStatusAlert } from '@/app/components/shared/ApiStatusAlert';
import { API_KEY_NAMES, getApiKey, saveApiKey } from '@/app/utils/apiKeyManager';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define the form schema
const formSchema = z.object({
  text: z.string().min(10, {
    message: "Text must be at least 10 characters.",
  }),
});

export default function VocabularyExtractorPage() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'warning' | 'not-configured'>('not-configured');
  const [apiMode, setApiMode] = useState<string | undefined>(undefined);
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState<boolean>(false);
  const [forceRealApi, setForceRealApi] = useState<boolean>(false);
  
  // Form handling
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });
  
  // Function to toggle demo mode
  const toggleDemoMode = () => {
    const newDemoMode = !useDemoMode;
    setUseDemoMode(newDemoMode);
    
    // If enabling demo mode, turn off force real API
    if (newDemoMode && forceRealApi) {
      setForceRealApi(false);
    }
    
    // Save preference to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('vocabulary-demo-mode', newDemoMode ? 'true' : 'false');
    }
    
    // Update status message
    if (newDemoMode) {
      setApiMode('demo');
      setApiStatus('connected');
      toast({
        title: "Demo Mode Enabled",
        description: "Using sample vocabulary data. No API calls will be made.",
      });
    } else {
      toast({
        title: "Live API Mode Enabled",
        description: "Using the Gemini API for vocabulary extraction.",
      });
      // Check API status to update mode
      checkApiStatus();
    }
  };
  
  // Function to toggle force real API
  const toggleForceRealApi = () => {
    const newForceReal = !forceRealApi;
    setForceRealApi(newForceReal);
    
    // Save preference to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('vocabulary-force-real-api', newForceReal ? 'true' : 'false');
    }
    
    // Show toast notification
    if (newForceReal) {
      toast({
        title: "Real API Mode Forced",
        description: "System will use the real Gemini API for extractions regardless of environment settings.",
      });
    } else {
      toast({
        title: "Real API Mode Disabled",
        description: "System will use the default API mode based on environment settings.",
      });
    }
    
    // Check API status to update mode
    checkApiStatus();
  };

  // Function to check API status
  const checkApiStatus = async () => {
    try {
      if (!geminiApiKey) {
        setApiStatus('not-configured');
        setApiMode(undefined);
        return;
      }
      
      setIsCheckingApi(true);
      
      // Make a small request to test the API
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey,
          'X-Demo-Mode': useDemoMode ? 'true' : 'false',
          'X-Force-Real-Api': forceRealApi ? 'true' : 'false',
        },
        body: JSON.stringify({ text: 'test' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApiStatus('connected');
        setApiMode(data.mode);
      } else {
        setApiStatus('error');
        setApiMode(undefined);
      }
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus('error');
      setApiMode(undefined);
    } finally {
      setIsCheckingApi(false);
    }
  };
  
  // Load API key and preferences on page load
  useEffect(() => {
    // Load demo mode preference
    if (typeof window !== 'undefined') {
      const savedDemoMode = localStorage.getItem('vocabulary-demo-mode');
      if (savedDemoMode) {
        setUseDemoMode(savedDemoMode === 'true');
        if (savedDemoMode === 'true') {
          setApiMode('demo');
          setApiStatus('connected');
        }
      }
      
      // Load force real API preference
      const savedForceRealApi = localStorage.getItem('vocabulary-force-real-api');
      if (savedForceRealApi) {
        setForceRealApi(savedForceRealApi === 'true');
      }
    }

    // Load API key
    const savedApiKey = getApiKey(API_KEY_NAMES.GEMINI);
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
      // Check API status after setting the key if not in demo mode
      if (!useDemoMode) {
        checkApiStatus();
      }
    } else {
      // Only show dialog automatically if we're not in demo mode and not in dev mode
      if (!useDemoMode && process.env.NODE_ENV !== 'development') {
        setShowApiKeyDialog(true);
      }
      
      // If no API key and not in demo mode, set as not configured
      if (!useDemoMode) {
        setApiStatus('not-configured');
      }
    }
  }, []);

  const handleSaveApiKey = async (apiKey: string, remember: boolean) => {
    setGeminiApiKey(apiKey);
    saveApiKey(API_KEY_NAMES.GEMINI, apiKey, remember);
    setShowApiKeyDialog(false);
    
    toast({
      title: "API Key Saved",
      description: remember 
        ? "Your Gemini API key has been saved for future sessions." 
        : "Your Gemini API key will be used for this session only.",
    });
    
    // Check API status with the new key
    await checkApiStatus();
  };

  const onFileUpload = (files: File[]) => {
    setSelectedFiles(files);
    console.log(`Added ${files.length} files for vocabulary extraction`);
  };
  
  const onSubmitText = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!useDemoMode && !geminiApiKey) {
        setShowApiKeyDialog(true);
        return;
      }
      
      setIsExtracting(true);
      setVocabulary([]);
      
      // Make API call to extract vocabulary from text
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey,
          'X-Demo-Mode': useDemoMode ? 'true' : 'false',
          'X-Force-Real-Api': forceRealApi ? 'true' : 'false',
        },
        body: JSON.stringify({ text: values.text }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVocabulary(data.vocabulary);
        setApiStatus('connected');
        setApiMode(data.mode);
        toast({
          title: "Vocabulary extracted",
          description: `Found ${data.vocabulary.length} vocabulary items (${data.mode} mode)`,
        });
      } else {
        setApiStatus('error');
        toast({
          title: "Extraction failed",
          description: data.error || "Failed to extract vocabulary",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to extract vocabulary:", error);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to extract vocabulary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  const extractFromFiles = async () => {
    try {
      if (!useDemoMode && !geminiApiKey) {
        setShowApiKeyDialog(true);
        return;
      }
      
      if (selectedFiles.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select at least one file to extract vocabulary from",
          variant: "destructive",
        });
        return;
      }
      
      setIsExtracting(true);
      setVocabulary([]);
      
      console.log(`Extracting vocabulary from ${selectedFiles.length} files`);
      
      // Create form data
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Send request to vocabulary extraction API
      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        headers: {
          'X-Gemini-API-Key': geminiApiKey,
          'X-Demo-Mode': useDemoMode ? 'true' : 'false',
          'X-Force-Real-Api': forceRealApi ? 'true' : 'false',
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVocabulary(data.vocabulary);
        setApiStatus('connected');
        setApiMode(data.mode);
        toast({
          title: "Vocabulary extracted",
          description: `Found ${data.vocabulary.length} vocabulary items (${data.mode} mode)`,
        });
      } else {
        setApiStatus('error');
        toast({
          title: "Extraction failed",
          description: data.error || "Failed to extract vocabulary",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to extract vocabulary:", error);
      setApiStatus('error');
      toast({
        title: "Error",
        description: "Failed to extract vocabulary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* API Status Alert */}
      {apiStatus && (
        <div className="mb-6">
          <ApiStatusAlert 
            status={apiStatus} 
            mode={apiMode}
            title={
              apiStatus === 'connected' ? 'Gemini API Connected' :
              apiStatus === 'error' ? 'Gemini API Error' :
              apiStatus === 'warning' ? 'API Key Warning' :
              'Gemini API Not Configured'
            }
            description={
              apiStatus === 'connected' ? 'Your API key is working correctly.' :
              apiStatus === 'error' ? 'There was an error with your API key. Please update it.' :
              apiStatus === 'warning' ? 'Your API key may have limited access.' :
              'Please configure your Gemini API key to use the vocabulary extractor.'
            }
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocabulary Extractor</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="demo-mode" className="text-sm">Demo Mode:</Label>
              <Switch
                id="demo-mode"
                checked={useDemoMode}
                onCheckedChange={toggleDemoMode}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="force-real-api" className="text-sm">Force Real API:</Label>
              <Switch
                id="force-real-api"
                checked={forceRealApi}
                onCheckedChange={toggleForceRealApi}
                disabled={useDemoMode}
              />
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiStatus}
            disabled={isCheckingApi || (useDemoMode ? false : !geminiApiKey)}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingApi ? 'animate-spin' : ''}`} />
            {isCheckingApi ? 'Checking...' : 'Check API'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyDialog(true)}
            className="flex items-center"
          >
            <Key className="h-4 w-4 mr-2" />
            {geminiApiKey ? 'Update API Key' : 'Set API Key'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="text">
        <TabsList className="mb-4">
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" /> From Text
          </TabsTrigger>
          <TabsTrigger value="files">
            <Image className="h-4 w-4 mr-2" /> From Files
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart className="h-4 w-4 mr-2" /> Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Extract from Text</CardTitle>
              <CardDescription>
                Paste your text below to extract vocabulary items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitText)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <Textarea 
                          {...field} 
                          placeholder="Paste your text here..." 
                          className="min-h-[200px]" 
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isExtracting}>
                    {isExtracting ? "Extracting..." : "Extract Vocabulary"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Extract from Files</CardTitle>
              <CardDescription>
                Upload images or PDFs to extract vocabulary items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FileUpload 
                  onFilesSelected={onFileUpload}
                  maxFiles={5}
                  acceptedFileTypes={{
                    'image/*': ['.png', '.jpg', '.jpeg'],
                    'application/pdf': ['.pdf'],
                  }}
                />
                <Button 
                  onClick={extractFromFiles} 
                  disabled={isExtracting || selectedFiles.length === 0}
                >
                  {isExtracting ? "Extracting..." : "Extract Vocabulary"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Statistics</CardTitle>
              <CardDescription>
                Overview of your vocabulary extraction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12">
                <p className="text-muted-foreground">
                  Statistics feature will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {vocabulary.length > 0 && (
        <div className="mt-8">
          <NewVocabularyDisplay vocabulary={vocabulary} title="Extracted Vocabulary" />
        </div>
      )}
      
      {/* Gemini API Key Dialog */}
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        title="Gemini API Key Setup"
        description="Enter your Gemini API key to enable vocabulary extraction. Your key will be stored securely and used only for vocabulary extraction requests."
        onSaveApiKey={handleSaveApiKey}
        initialApiKey={geminiApiKey}
      />
    </div>
  );
}