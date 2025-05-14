'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, Image, BookText, Key, Save } from "lucide-react";
import { FlashcardComponent } from '@/components/ui/flashcard';
import { Flashcard, FlashcardSubmission } from '@/types/flashcards';
import { FlashcardService } from '@/lib/flashcard-service';
import { 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  generateFlashcardsFromText, 
  generateFlashcardsFromImage,
  generateFallbackFlashcards,
  DEFAULT_GEMINI_MODEL,
  AVAILABLE_MODELS
} from '@/lib/gemini-api-fixed';
import { GeminiModelSelector } from '@/components/ui/gemini-model-selector';
import { EDUCATIONAL_FLASHCARD_PROMPT, EDUCATIONAL_IMAGE_FLASHCARD_PROMPT } from '@/lib/ai-prompts';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiKeyValidator } from '@/components/ui/gemini-key-validator';
import { FlashcardThemeSelector, type FlashcardTheme } from '@/components/ui/flashcard-theme-selector';

export default function CreateFlashcardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('text');
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [deckName, setDeckName] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);  
  const [generatedFlashcards, setGeneratedFlashcards] = useState<FlashcardSubmission[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('new');
  const [existingDecks, setExistingDecks] = useState<Array<{id: string, name: string}>>([]);  
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [selectedTheme, setSelectedTheme] = useState<FlashcardTheme>('default');
  // No longer using different tutoring styles
  const [selectedStyle, setSelectedStyle] = useState('educational');
  
  // Load existing decks on component mount
  React.useEffect(() => {
    const decks = FlashcardService.getDecks();
    setExistingDecks(decks.map(deck => ({ id: deck.id, name: deck.name })));
  }, []);
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string || null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save API key
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    saveGeminiApiKey(apiKey);
    setSuccess('API key saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  
  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Get the latest API key
      const currentKey = getGeminiApiKey();
      setApiKey(currentKey);
      
      if (!currentKey) {
        setError('Please enter a Gemini API key first. Verify it works by clicking "Validate & Save".');
        setIsLoading(false);
        return;
      }
      
      if (activeTab === 'text' && !text.trim()) {
        setError('Please enter some text to generate flashcards from');
        setIsLoading(false);
        return;
      }
      
      if (activeTab === 'image' && !image) {
        setError('Please upload an image to generate flashcards from');
        setIsLoading(false);
        return;
      }
      
      // Generate flashcards based on active tab
      let flashcards: Array<{question: string, answer: string}>;
      let usedFallback = false;
      
      if (activeTab === 'text') {
        try {
          // Generate flashcards with the selected model
          let generatedCards = await generateFlashcardsFromText(
            text, 
            parseInt(cardCount), 
            currentKey, 
            selectedModel
          );
          
          // Add metadata to each flashcard
          flashcards = generatedCards.map(card => ({
            ...card,
            model: selectedModel,
            generatedBy: 'ai' as const,
            tags: [
              'ai-generated', 
              `model:${selectedModel}`,
              'german'
            ]
          }));
          
        } catch (err) {
          console.warn("API-based flashcard generation failed, using fallback:", err);
          const fallbackCards = generateFallbackFlashcards(text, parseInt(cardCount));
          
          // Add metadata to fallback cards too
          flashcards = fallbackCards.map(card => ({
            ...card,
            generatedBy: 'ai' as const,
            tags: ['ai-generated', 'fallback-mode']
          }));
          
          usedFallback = true;
        }
      } else {
        if (!image) throw new Error('No image selected');
        
        try {
          // Generate flashcards from image
          let generatedCards = await generateFlashcardsFromImage(
            image, 
            parseInt(cardCount), 
            currentKey, 
            selectedModel
          );
          
          // Add metadata to image-based flashcards
          flashcards = generatedCards.map(card => ({
            ...card,
            model: selectedModel,
            generatedBy: 'ai' as const,
            tags: [
              'ai-generated', 
              'image-based', 
              `model:${selectedModel}`,
              'german'
            ]
          }));
          
        } catch (err) {
          // For images, we cannot use the fallback mechanism since we need AI to interpret the image
          console.warn("Image-based flashcard generation failed:", err);
          setError(`Image processing failed. Please check your API key or try another image.`);
          throw new Error('Image processing failed');
        }
      }
      
      setGeneratedFlashcards(flashcards);
      setPreviewCardIndex(0);
      
      if (flashcards.length > 0) {
        if (usedFallback) {
          setSuccess("Used basic flashcard generation due to API issues. Results may be limited.");
        } else {
          setSuccess("AI flashcards generated successfully!");
        }
        setTimeout(() => setSuccess(null), 3000);
      }
      
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setError(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save flashcards to a deck
  const handleSaveFlashcards = () => {
    try {
      if (generatedFlashcards.length === 0) {
        setError('No flashcards to save');
        return;
      }
      
      let deckId: string;
      
      // Create new deck or use existing one
      if (selectedDeck === 'new') {
        if (!deckName.trim()) {
          setError('Please enter a name for the new deck');
          return;
        }
        
        const newDeck = FlashcardService.createDeck(deckName);
        deckId = newDeck.id;
      } else {
        deckId = selectedDeck;
      }
      
      // Save the flashcards
      FlashcardService.createFlashcards(deckId, generatedFlashcards);
      
      setSuccess('Flashcards saved successfully!');
      
      // Navigate to the deck after a brief delay
      setTimeout(() => {
        router.push(`/flashcards/deck/${deckId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving flashcards:', err);
      setError(`Failed to save flashcards: ${err.message}`);
    }
  };
  
  // Preview controls
  const handleCardAction = (action: 'prev' | 'next' | 'flip') => {
    if (action === 'next' && previewCardIndex < generatedFlashcards.length - 1) {
      setPreviewCardIndex(previewCardIndex + 1);
    } else if (action === 'prev' && previewCardIndex > 0) {
      setPreviewCardIndex(previewCardIndex - 1);
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Flashcards with AI
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Turn your text or images into high-quality study materials
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => router.push('/flashcards')}
              className="flex items-center gap-2"
            >
              <span className="rotate-180 inline-block">➜</span> Back to Decks
            </Button>
          </div>
        </div>
      
        {/* API Key Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-500">
          <GeminiKeyValidator 
            onValidationComplete={(isValid, models) => {
              if (isValid) {
                setApiKey(getGeminiApiKey());
                setSuccess("API key validated successfully!");
                setTimeout(() => setSuccess(null), 3000);
              }
            }} 
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Input Section - Takes 3/5 of the space on large screens */}
          <Card className="xl:col-span-3 shadow-lg border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-left duration-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <BookText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Create Flashcards</CardTitle>
                  <CardDescription>
                    Add your content to generate AI-powered study cards
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 grid grid-cols-2 w-full">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <BookText className="h-4 w-4" />
                    From Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    From Image
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste your study text here... (Textbooks, lecture notes, articles, etc.)"
                      className="min-h-[250px] resize-none focus:ring-2 focus:ring-blue-500"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="image">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 transition-all hover:border-blue-400 dark:hover:border-blue-600">
                      <input 
                        type="file" 
                        id="image-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img 
                            src={imagePreview} 
                            alt="Uploaded preview" 
                            className="max-h-[240px] mx-auto rounded-lg object-contain shadow-md" 
                          />
                          <div className="flex justify-center mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                              }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-red-500">×</span> Change Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Image className="h-16 w-16 mb-4 text-gray-400 opacity-70" />
                          <p className="text-lg text-center text-gray-500 dark:text-gray-400 mb-2">
                            Upload an image containing educational content
                          </p>
                          <p className="text-sm text-center text-muted-foreground mb-6">
                            Diagrams, charts, graphs, or text-based imagery
                          </p>
                          <Label 
                            htmlFor="image-upload" 
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg transition-colors duration-200 flex items-center gap-2 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Select Image
                          </Label>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Generation Options */}
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Label htmlFor="card-count" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                      Number of Flashcards
                    </Label>
                    <div className="flex items-center gap-4">
                      <Select value={cardCount} onValueChange={setCardCount}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 cards</SelectItem>
                          <SelectItem value="5">5 cards</SelectItem>
                          <SelectItem value="10">10 cards</SelectItem>
                          <SelectItem value="15">15 cards</SelectItem>
                          <SelectItem value="20">20 cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                      Card Theme
                    </Label>
                    <FlashcardThemeSelector 
                      defaultTheme={selectedTheme}
                      onThemeChange={(theme) => {
                        setSelectedTheme(theme);
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    AI Model
                  </Label>
                  <GeminiModelSelector 
                    defaultValue={selectedModel}
                    onModelChange={(modelId) => {
                      setSelectedModel(modelId);
                      localStorage.setItem('preferred_gemini_model', modelId);
                    }}
                  />
                  {selectedModel !== DEFAULT_GEMINI_MODEL && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Using {AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS]?.name || selectedModel} 
                      {AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS]?.recommended ? " (recommended)" : ""}
                    </p>
                  )}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    AI Flashcard Quality
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white/60 dark:bg-gray-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <div className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800/40 rounded-full flex items-center justify-center text-blue-600">🇩🇪</div>
                        <span>German language output</span>
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <div className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800/40 rounded-full flex items-center justify-center text-blue-600">✓</div>
                        <span>Deep content understanding</span>
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <div className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800/40 rounded-full flex items-center justify-center text-blue-600">🧠</div>
                        <span>Conceptual focus over facts</span>
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <div className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800/40 rounded-full flex items-center justify-center text-blue-600">⭐</div>
                        <span>Expert-level questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                onClick={handleGenerateFlashcards} 
                disabled={isLoading || (!text && activeTab === 'text') || (!image && activeTab === 'image')}
                className="w-full py-6 text-lg font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 2v7a4 4 0 0 0 4 4h7v4a7 7 0 0 1-7 7h0a7 7 0 0 1-7-7v0-8a7 7 0 0 1 7-7h0Z"></path>
                      <path d="M12 16a4 4 0 0 1 0-8"></path>
                    </svg>
                    Generate AI Flashcards
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Preview and Save Section - Takes 2/5 of the space on large screens */}
          <Card className="xl:col-span-2 shadow-lg border-t-4 border-t-purple-500 animate-in fade-in slide-in-from-right duration-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M7 7h10"></path>
                    <path d="M7 12h10"></path>
                    <path d="M7 17h10"></path>
                  </svg>
                </div>
                <div>
                  <CardTitle>Preview & Save</CardTitle>
                  <CardDescription>
                    {generatedFlashcards.length > 0 
                      ? `${generatedFlashcards.length} flashcards ready to review` 
                      : 'Your generated flashcards will appear here'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-0 min-h-[400px] flex flex-col">
              {generatedFlashcards.length > 0 ? (
                <div className="space-y-6 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={previewCardIndex === 0}
                      onClick={() => handleCardAction('prev')}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      ← Previous
                    </Button>
                    <div className="text-center text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      Card {previewCardIndex + 1} of {generatedFlashcards.length}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={previewCardIndex === generatedFlashcards.length - 1}
                      onClick={() => handleCardAction('next')}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Next →
                    </Button>
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-center">
                    <FlashcardComponent 
                      card={{
                        id: `preview-${previewCardIndex}`,
                        question: generatedFlashcards[previewCardIndex].question,
                        answer: generatedFlashcards[previewCardIndex].answer,
                        createdAt: new Date().toISOString(),
                        deckId: 'preview',
                        tags: selectedModel ? [AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS]?.name || selectedModel] : undefined,
                        model: selectedModel,
                        generatedBy: 'ai'
                      }}
                      mode="standard"
                      theme={selectedTheme}
                      showControls={true}
                      showConfidence={false}
                      onCardAction={(action, value) => {
                        if (action === 'prev' || action === 'next' || action === 'flip') {
                          handleCardAction(action);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                    <div className="space-y-4">
                      <div className="w-full">
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                          Save Flashcards To:
                        </Label>
                        <Select value={selectedDeck} onValueChange={setSelectedDeck}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a deck" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">
                              Create New Deck
                            </SelectItem>
                            <SelectItem value="_divider" disabled>
                              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                            </SelectItem>
                            {existingDecks.map((deck) => (
                              <SelectItem key={deck.id} value={deck.id}>
                                {deck.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedDeck === 'new' && (
                        <div className="animate-in fade-in duration-200">
                          <Label htmlFor="deck-name" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                            New Deck Name:
                          </Label>
                          <Input 
                            id="deck-name" 
                            placeholder="Enter a name for your new deck" 
                            value={deckName} 
                            onChange={(e) => setDeckName(e.target.value)}
                            className="w-full" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex-grow flex items-center justify-center text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center p-8">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        </div>
                        <div className="absolute inset-0 border-t-4 border-blue-500 border-opacity-20 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-lg font-medium mt-6">Generating flashcards...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        The AI is creating high-quality study materials from your content
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-8">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                          <path d="M12 8v8"></path>
                          <path d="M8 12h8"></path>
                        </svg>
                      </div>
                      <p className="text-lg font-medium">No flashcards yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Add content and click the generate button
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6 mt-6">
              <Button 
                onClick={handleSaveFlashcards} 
                disabled={generatedFlashcards.length === 0 || (selectedDeck === 'new' && !deckName.trim())}
                className="w-full py-6"
                variant={generatedFlashcards.length > 0 ? "default" : "outline"}
                size="lg"
              >
                <Save className="h-5 w-5 mr-2" />
                Save {generatedFlashcards.length} Flashcards
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Notification area */}
      <div className="fixed bottom-4 right-4 w-96 z-50 space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-right duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 animate-in slide-in-from-right duration-300">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}