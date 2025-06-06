'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlashcardDeck } from '@/types/flashcards';
import { FlashcardService } from '@/lib/flashcard-service';
import { AlertCircle, Book, Calendar, Clock, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load decks
  useEffect(() => {
    try {
      const allDecks = FlashcardService.getDecks();
      setDecks(allDecks);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading flashcard decks:', err);
      setError('Failed to load flashcard decks');
      setIsLoading(false);
    }
  }, []);

  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deck.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format time ago
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };
  
  // Get color styles
  const getDeckColorStyles = (color?: string) => {
    const defaultColor = '#3b82f6'; // Default blue
    const bgColor = color || defaultColor;
    
    // Create a lighter version for the background
    const lighter = `${bgColor}20`; // 20% opacity version of the color
    
    return {
      borderColor: bgColor,
      backgroundColor: lighter
    };
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcard Decks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review and manage your study flashcards
          </p>
        </div>
        
        <Button asChild>
          <Link href="/flashcards/create">
            <Plus className="h-4 w-4 mr-1" />
            Create New Flashcards
          </Link>
        </Button>
      </div>
      
      {/* Info alert about Gemini API */}
      <Alert className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600 dark:text-blue-400">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
        <AlertTitle className="text-blue-800 dark:text-blue-200">About AI Flashcards</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This feature uses the Gemini API to create flashcards from text and images. You'll need to provide your own API key, which requires access to the <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-sm">gemini-1.5-flash</span> model.
        </AlertDescription>
      </Alert>
      
      {/* Search and filters */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search decks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Deck grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading flashcard decks...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredDecks.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No matching decks found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your search query
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No flashcard decks yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create your first flashcard deck to get started
                  </p>
                  <Button asChild>
                    <Link href="/flashcards/create">
                      <Plus className="h-4 w-4 mr-1" />
                      Create New Flashcards
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map((deck) => (
                <Card 
                  key={deck.id} 
                  className="overflow-hidden border-t-4 transition-all hover:shadow-md"
                  style={{ borderTopColor: deck.color || '#3b82f6' }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
                      <Badge variant="outline">
                        {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {deck.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Created {formatDate(deck.createdAt)}
                      </div>
                      {deck.lastOpened && (
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Last used {formatTimeAgo(deck.lastOpened)}
                        </div>
                      )}
                    </div>
                    
                    {/* Tags if available */}
                    {deck.tags && deck.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {deck.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Button asChild className="w-full">
                      <Link href={`/flashcards/deck/${deck.id}`}>
                        <Book className="h-4 w-4 mr-1" />
                        Study Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}