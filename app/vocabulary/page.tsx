'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image as ImageIcon, 
  BookOpen, 
  RefreshCw, 
  Trash2,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
  Key,
  Save,
  Plus,
  FolderPlus
} from "lucide-react";

interface VocabularyItem {
  english: string;
  german: string;
  confidence?: number;
}

interface FlashCard extends VocabularyItem {
  id: string;
  showEnglish: boolean;
}

interface VocabularyDeck {
  id: string;
  name: string;
  cards: VocabularyItem[];
  createdAt: string;
}

export default function VocabularyPage() {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [vocabularyDecks, setVocabularyDecks] = useState<VocabularyDeck[]>([]);
  const [showSaveDeck, setShowSaveDeck] = useState<boolean>(false);
  const [deckName, setDeckName] = useState<string>('');

  // Load decks from localStorage on mount
  React.useEffect(() => {
    const savedDecks = localStorage.getItem('vocabularyDecks');
    if (savedDecks) {
      try {
        setVocabularyDecks(JSON.parse(savedDecks));
      } catch (error) {
        console.error('Error loading vocabulary decks:', error);
      }
    }
  }, []);

  // Check for API key on component mount and load it into input
  React.useEffect(() => {
    const apiKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('gemini_api_key='))
      ?.split('=')[1];
    setHasApiKey(!!apiKey);
    if (apiKey) {
      setApiKeyInput(apiKey);
    }
  }, []);

  // Save API key to cookies
  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      // Set cookie that expires in 30 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `gemini_api_key=${apiKeyInput.trim()}; expires=${expiryDate.toUTCString()}; path=/`;
      setHasApiKey(true);
      setShowApiKeyInput(false);
    } else {
      // Remove cookie if empty
      document.cookie = 'gemini_api_key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      setHasApiKey(false);
    }
  };
  // Clear API key
  const clearApiKey = () => {
    document.cookie = 'gemini_api_key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    setApiKeyInput('');
    setHasApiKey(false);
    setShowApiKeyInput(false);
  };

  // Save deck to localStorage
  const saveDeck = () => {
    if (!deckName.trim() || flashCards.length === 0) return;

    const newDeck: VocabularyDeck = {
      id: `deck-${Date.now()}`,
      name: deckName.trim(),
      cards: flashCards.map(({ id, showEnglish, ...item }) => item),
      createdAt: new Date().toISOString()
    };

    const updatedDecks = [...vocabularyDecks, newDeck];
    setVocabularyDecks(updatedDecks);
    localStorage.setItem('vocabularyDecks', JSON.stringify(updatedDecks));
    
    setShowSaveDeck(false);
    setDeckName('');
  };

  // Load deck into flashcards
  const loadDeck = (deck: VocabularyDeck) => {
    const loadedCards: FlashCard[] = deck.cards.map((item, index) => ({
      ...item,
      id: `card-${Date.now()}-${index}`,
      showEnglish: false
    }));
    setFlashCards(loadedCards);
    setExtractionResults(`Loaded deck "${deck.name}" with ${deck.cards.length} cards`);
  };

  // Delete deck
  const deleteDeck = (deckId: string) => {
    const updatedDecks = vocabularyDecks.filter(deck => deck.id !== deckId);
    setVocabularyDecks(updatedDecks);
    localStorage.setItem('vocabularyDecks', JSON.stringify(updatedDecks));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setImages(imageFiles);
    setError(null);
  };

  // Remove image from list
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };  // Extract vocabulary using existing Gemini API integration
  const extractVocabulary = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractionResults('');

    try {
      // Get Gemini API key from cookies (using your existing system)
      const apiKey = document.cookie
        .split('; ')
        .find(row => row.startsWith('gemini_api_key='))
        ?.split('=')[1];

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      
      // Include API key in request if available (demo mode if not)
      if (apiKey) {
        formData.append('apiKey', apiKey);
      }

      const response = await fetch('/api/vocabulary/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }      // Convert vocabulary items to flashcards
      const newFlashCards: FlashCard[] = data.vocabulary.map((item: VocabularyItem, index: number) => ({
        ...item,
        id: `card-${Date.now()}-${index}`,
        showEnglish: false
      }));

      setFlashCards(newFlashCards);
      setExtractionResults(data.extractionLog || 'Vocabulary extracted successfully');
      
    } catch (error) {
      console.error('Error extracting vocabulary:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract vocabulary');
    } finally {
      setLoading(false);
    }
  };
  // Toggle card visibility
  const toggleCard = (id: string) => {
    setFlashCards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, showEnglish: !card.showEnglish } : card
      )
    );
  };

  // Export flashcards as JSON
  const exportFlashCards = () => {
    const exportData = {
      vocabulary: flashCards.map(({ id, showEnglish, ...item }) => item),
      exportDate: new Date().toISOString(),
      totalCards: flashCards.length
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-flashcards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const clearAll = () => {
    setImages([]);
    setFlashCards([]);
    setError(null);
    setExtractionResults('');
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="h-8 w-8 mr-3 text-primary" />
          Vocabulary Extractor
        </h1>
        <p className="text-muted-foreground">
          Upload images of vocabulary pages from textbooks to automatically generate flashcards
        </p>      </div>

      {/* API Key Configuration Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Gemini API Key Configuration
            </span>
            {hasApiKey && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {hasApiKey 
              ? "API key is configured. You can update it or use demo mode."
              : "Enter your Gemini API key to enable real image analysis, or use demo mode with sample data."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!showApiKeyInput && !hasApiKey && (
              <Button 
                variant="outline" 
                onClick={() => setShowApiKeyInput(true)}
                className="w-full sm:w-auto"
              >
                <Key className="h-4 w-4 mr-2" />
                Configure API Key
              </Button>
            )}
            
            {!showApiKeyInput && hasApiKey && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApiKeyInput(true)}
                  className="flex items-center"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Update API Key
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearApiKey}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Key
                </Button>
              </div>
            )}

            {showApiKeyInput && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key (AIza...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                  />
                  <Button onClick={saveApiKey} disabled={!apiKeyInput.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowApiKeyInput(false);
                      setApiKeyInput(hasApiKey ? document.cookie
                        .split('; ')
                        .find(row => row.startsWith('gemini_api_key='))
                        ?.split('=')[1] || '' : '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your free API key from{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Key Status Alert */}
      {!hasApiKey && (
        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/30">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-700 dark:text-orange-300">Demo Mode</AlertTitle>
          <AlertDescription className="text-orange-600 dark:text-orange-400">
            No Gemini API key detected. The extractor will use sample vocabulary data for demonstration. 
            To enable real image analysis, configure your API key in the flashcard settings.
          </AlertDescription>
        </Alert>
      )}

      {hasApiKey && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-300">AI Mode Active</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-400">
            Gemini API key detected. The extractor will analyze your images using AI to extract real vocabulary.
          </AlertDescription>
        </Alert>
      )}

      {/* Saved Decks Section */}
      {vocabularyDecks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderPlus className="h-5 w-5 mr-2" />
              Saved Vocabulary Decks
            </CardTitle>
            <CardDescription>
              Load previously saved vocabulary decks for study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vocabularyDecks.map((deck) => (
                <div key={deck.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium truncate">{deck.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDeck(deck.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {deck.cards.length} cards • {new Date(deck.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDeck(deck)}
                    className="w-full"
                  >
                    Load Deck
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Images (Max 5)
          </CardTitle>
          <CardDescription>
            Upload clear images of vocabulary pages. Works best with pages that have English on the left and German on the right.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            
            {images.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Images:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="flex items-center p-3 bg-muted rounded-lg">
                        <ImageIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{image.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={extractVocabulary} 
                disabled={images.length === 0 || loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Extract Vocabulary
                  </>
                )}
              </Button>
              
              {(images.length > 0 || flashCards.length > 0) && (
                <Button variant="outline" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Extraction Results */}
      {extractionResults && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Extraction Complete</AlertTitle>
          <AlertDescription>{extractionResults}</AlertDescription>
        </Alert>
      )}

      {/* Flashcards Section */}
      {flashCards.length > 0 && (
        <div className="space-y-6">          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Generated Flashcards</h2>
              <p className="text-muted-foreground">
                Click on cards to reveal English translations • {flashCards.length} cards generated
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowSaveDeck(true)} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Deck
              </Button>
              <Button onClick={exportFlashCards} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Save Deck Dialog */}
          {showSaveDeck && (
            <Card className="mb-4 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Save Vocabulary Deck</CardTitle>
                <CardDescription>
                  Give your vocabulary deck a name to save it for later study
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter deck name..."
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && saveDeck()}
                  />
                  <Button onClick={saveDeck} disabled={!deckName.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveDeck(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            {flashCards.map((card) => (
              <Card 
                key={card.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
                onClick={() => toggleCard(card.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{card.german}</CardTitle>
                    <Button variant="ghost" size="sm" className="p-1">
                      {card.showEnglish ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[3rem] flex items-center justify-center">
                    {card.showEnglish ? (
                      <div className="text-center">
                        <p className="text-xl font-medium text-primary mb-1">{card.english}</p>
                        {card.confidence && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(card.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">Click to reveal English translation</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Study Mode Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Study Tips</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Try to recall the German word before clicking to reveal</li>
                    <li>• Practice regularly with small sets of vocabulary</li>
                    <li>• Export your flashcards to use in other study apps</li>
                    <li>• Review difficult words more frequently</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}