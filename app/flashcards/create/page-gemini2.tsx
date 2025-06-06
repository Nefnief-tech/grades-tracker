'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FlashcardDeck, FlashcardSubmission } from '@/types/flashcards';
import { FlashcardService } from '@/lib/flashcard-service';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { HexColorPicker } from "react-colorful";
import { AlertCircle, Clock, Wand2, X, ImagePlus, Loader2, BookOpen, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GeminiKeyValidator } from '@/components/ui/gemini-key-validator-enhanced';
import Gemini2ModelSelector from '@/components/ui/gemini2-model-selector';
import SubjectAreaSelector, { SubjectArea } from '@/components/ui/subject-area-selector';
import { Gemini2Service, Gemini2Model } from '@/lib/gemini2-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Card type for temporary cards being edited
interface CardItem extends FlashcardSubmission {
  id: string; // Temporary ID for UI management
}

export default function CreateFlashcardsPage() {
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [deckColor, setDeckColor] = useState('#3b82f6'); // Default blue
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [sourceText, setSourceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI model configuration
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [selectedModel, setSelectedModel] = useState<Gemini2Model>('gemini-2.0-pro');
  const [subjectArea, setSubjectArea] = useState<SubjectArea | undefined>(undefined);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  
  const toast = useToast();
  const router = useRouter();

  // Reset form
  const resetForm = () => {
    setDeckName('');
    setDeckDescription('');
    setDeckColor('#3b82f6');
    setCards([]);
    setCurrentQuestion('');
    setCurrentAnswer('');
    setError(null);
    setSourceText('');
    setImageFile(null);
    setImagePreview(null);
  };

  // Add a card to the list
  const addCard = () => {
    if (!currentQuestion.trim() || !currentAnswer.trim()) {
      toast.toast({
        title: "Empty fields",
        description: "Question and answer cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newCard: CardItem = {
      id: uuidv4(), // Generate temporary ID for the UI
      question: currentQuestion.trim(),
      answer: currentAnswer.trim(),
      tags: []
    };

    setCards([...cards, newCard]);
    setCurrentQuestion('');
    setCurrentAnswer('');
    
    toast.toast({
      title: "Card added",
      description: `Added card "${currentQuestion.substring(0, 30)}${currentQuestion.length > 30 ? '...' : ''}"`,
    });
  };

  // Remove a card from the list
  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  // Handle file selection for images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 4MB)
      const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
      if (file.size > MAX_FILE_SIZE) {
        toast.toast({
          title: "File too large",
          description: "Image must be less than 4MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image selection
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate flashcards from text/image using Gemini 2.0
  const generateFlashcards = async () => {
    if (!geminiApiKey) {
      setError("Please enter your Gemini API key first");
      return;
    }

    if ((!sourceText || sourceText.trim().length < 20) && !imageFile) {
      setError("Please enter text (at least 20 characters) or upload an image to generate flashcards");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Initialize the enhanced Gemini 2.0 service
      const geminiService = new Gemini2Service({
        apiKey: geminiApiKey,
        model: selectedModel
      });
      
      let generatedCards: FlashcardSubmission[] = [];
      
      if (imageFile && sourceText && sourceText.trim().length >= 20) {
        // Combined text and image
        const imageBase64 = imagePreview as string;
        generatedCards = await geminiService.generateFlashcardsFromCombined(sourceText, imageBase64);
      } else if (imageFile) {
        // Image only
        const imageBase64 = imagePreview as string;
        generatedCards = await geminiService.generateFlashcardsFromImage(imageBase64);
      } else {
        // Text only
        generatedCards = await geminiService.generateFlashcardsFromText(sourceText);
      }
      
      // Add the generated cards to our list with temporary IDs
      const newCards = generatedCards.map(card => ({
        ...card,
        id: uuidv4() // Assign a temporary ID for UI management
      }));
      
      setCards([...cards, ...newCards]);
      
      toast.toast({
        title: "Flashcards generated",
        description: `Successfully generated ${newCards.length} flashcards with Gemini 2.0`,
      });
      
      // Clear the source text and image after successful generation
      setSourceText('');
      clearImage();
      
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError(`Failed to generate flashcards: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save the deck
  const saveDeck = async () => {
    if (!deckName.trim()) {
      setError("Please enter a deck name");
      return;
    }

    if (cards.length === 0) {
      setError("Please add at least one card to your deck");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the flashcards without the temporary IDs
      const flashcards: FlashcardSubmission[] = cards.map(({ id, ...rest }) => rest);
      
      // Create the deck
      const newDeck: Partial<FlashcardDeck> = {
        name: deckName.trim(),
        description: deckDescription.trim(),
        color: deckColor,
        tags: extractTags(flashcards),
      };
      
      const createdDeck = FlashcardService.createDeck(newDeck);
      
      // Add cards to the deck
      const createdCards = FlashcardService.createFlashcards(createdDeck.id, flashcards);
      
      toast.toast({
        title: "Deck created",
        description: `Successfully created deck "${deckName}" with ${createdCards.length} cards`,
      });
      
      // Redirect to the deck page
      router.push(`/flashcards/deck/${createdDeck.id}`);
    } catch (err) {
      console.error("Error saving deck:", err);
      setError(`Failed to save flashcard deck: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  // Extract unique tags from all flashcards
  const extractTags = (flashcards: FlashcardSubmission[]): string[] => {
    const tagSet = new Set<string>();
    flashcards.forEach(card => {
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tagSet.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tagSet);
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Flashcards</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            Create a new deck of flashcards for studying
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ml-2">
              <Sparkles className="h-3 w-3 mr-1" /> Gemini 2.0
            </Badge>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Deck Info */}
        <Card>
          <CardHeader>
            <CardTitle>Deck Information</CardTitle>
            <CardDescription>Enter the basic details for your flashcard deck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                placeholder="Enter deck name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck-description">Description (Optional)</Label>
              <Textarea
                id="deck-description"
                placeholder="Enter a description for this deck"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck-color">Deck Color</Label>
              <div className="flex items-center space-x-2">
                <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <span>Select Color</span>
                      <div
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: deckColor }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <HexColorPicker color={deckColor} onChange={setDeckColor} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flashcards Creation */}
        <Card>
          <CardHeader>
            <CardTitle>Create Flashcards</CardTitle>
            <CardDescription>Add flashcards to your deck manually or generate them with Gemini 2.0 AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Manual Creation</TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="h-4 w-4 mr-1.5 text-blue-500" />
                  Gemini 2.0 Generation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter question"
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder="Enter answer"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={addCard}
                    type="button"
                    className="mt-2"
                  >
                    Add Card
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4">
                {/* Gemini API Key */}
                <GeminiKeyValidator
                  value={geminiApiKey}
                  onChange={setGeminiApiKey}
                  onValidationResult={setIsKeyValid}
                />

                {/* Model and subject selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Gemini2ModelSelector
                    value={selectedModel}
                    onChange={setSelectedModel}
                    disabled={!geminiApiKey || isProcessing}
                  />
                  
                  <SubjectAreaSelector 
                    value={subjectArea}
                    onChange={setSubjectArea}
                    disabled={!geminiApiKey || isProcessing}
                  />
                </div>

                {/* Source text and image upload */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="source-text">Source Text</Label>
                    <span className="text-xs text-muted-foreground">
                      {sourceText.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="source-text"
                    placeholder="Enter text to generate flashcards from (notes, definitions, concepts, etc.)"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="min-h-[150px]"
                    disabled={isProcessing}
                  />
                </div>
                
                {/* Image upload */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Image (Optional)</Label>
                  <div className="flex flex-col space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors ${
                          imageFile ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isProcessing}
                        />
                        <div className="flex flex-col items-center justify-center py-4">
                          <ImagePlus className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {imageFile ? "Replace image" : "Click to upload an image"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, WebP up to 4MB
                          </p>
                        </div>
                      </div>
                      
                      {imagePreview && (
                        <div className="relative border rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-auto max-h-[150px] object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full"
                            onClick={clearImage}
                            disabled={isProcessing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={generateFlashcards}
                      disabled={(!sourceText && !imageFile) || !geminiApiKey || isProcessing || isKeyValid === false}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating with Gemini 2.0...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Flashcards with Gemini 2.0
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Information about Gemini 2.0 */}
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <AlertTitle>About Gemini 2.0</AlertTitle>
                  <AlertDescription className="text-sm">
                    <p>Gemini 2.0 is Google's latest AI model with improved capabilities:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Higher quality flashcards with better understanding of complex topics</li>
                      <li>Enhanced reasoning for more accurate question and answer pairs</li>
                      <li>Superior image analysis for diagrams, charts, and visual content</li>
                      <li>More comprehensive coverage of academic subjects</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Flashcards List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Flashcards ({cards.length})</CardTitle>
              <CardDescription>Review your flashcards before saving</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {cards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No flashcards added yet</p>
                <p className="text-sm mt-1">Add flashcards manually or generate them with Gemini 2.0</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card, index) => (
                  <Card key={card.id} className="overflow-visible">
                    <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
                      <div className="space-y-1.5">
                        <CardTitle className="text-base">Card {index + 1}</CardTitle>
                        {card.tags && card.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {card.tags.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeCard(card.id)}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Question:</h4>
                        <p>{card.question}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Answer:</h4>
                        <p>{card.answer}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            onClick={saveDeck}
            disabled={isSubmitting || cards.length === 0 || !deckName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Deck
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}