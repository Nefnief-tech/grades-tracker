'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardComponent } from '@/components/ui/flashcard';
import { FlashcardDeck, Flashcard, ReviewMode } from '@/types/flashcards';
import { FlashcardService } from '@/lib/flashcard-service';
import { AlertCircle, ArrowLeft, BarChart2, Book, Clock, Edit, List, Play, Plus, Settings, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;
  
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeTab, setActiveTab] = useState<'learn' | 'list' | 'stats'>('learn');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('standard');
  const [shuffleCards, setShuffleCards] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  
  // Load deck and cards
  useEffect(() => {
    if (!deckId) return;
    
    try {
      // Get deck
      const deckData = FlashcardService.getDeck(deckId);
      if (!deckData) {
        setError('Deck not found');
        setIsLoading(false);
        return;
      }
      
      setDeck(deckData);
      
      // Get cards
      let cardsData = FlashcardService.getCardsByDeck(deckId);
      
      // Shuffle if needed
      if (shuffleCards) {
        cardsData = shuffleArray(cardsData);
      }
      
      setCards(cardsData);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error loading deck:', err);
      setError('Failed to load flashcard deck');
      setIsLoading(false);
    }
  }, [deckId, shuffleCards]);
  
  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle card navigation
  const handleCardAction = (action: 'prev' | 'next' | 'flip' | 'confidence', value?: number) => {
    if (action === 'next') {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
    } else if (action === 'prev') {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      }
    } else if (action === 'confidence' && typeof value === 'number' && cards[currentCardIndex]) {
      // Mark card as reviewed with confidence level
      const updatedCard = FlashcardService.markCardAsReviewed(
        cards[currentCardIndex].id, 
        value
      );
      
      // Update the card in our local state
      const updatedCards = [...cards];
      updatedCards[currentCardIndex] = updatedCard;
      setCards(updatedCards);
      
      // Add to completed cards
      setCompletedCards(prev => new Set(prev).add(cards[currentCardIndex].id));
      
      // Move to next card after a brief delay
      setTimeout(() => {
        if (currentCardIndex < cards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
        }
      }, 500);
    }
  };
  
  // Format time for last reviewed
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
    
    return date.toLocaleDateString();
  };
  
  // Calculate progress percentage
  const progressPercentage = cards.length > 0 
    ? Math.round((completedCards.size / cards.length) * 100)
    : 0;
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }
  
  if (error || !deck) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Failed to load deck'}</AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <Button asChild>
            <Link href="/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Deck header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <Badge variant="outline" className="ml-2">
              {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          {deck.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{deck.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/flashcards/edit-deck/${deckId}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/flashcards/create">
              <Plus className="h-4 w-4 mr-1" />
              Add Cards
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{completedCards.size} of {cards.length} reviewed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
      
      {/* Main content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="learn" className="flex items-center">
            <Play className="h-4 w-4 mr-1" />
            Study
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="h-4 w-4 mr-1" />
            Card List
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>
        
        {/* Study Tab */}
        <TabsContent value="learn">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Study Mode
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShuffleCards(!shuffleCards)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cards.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="mode">Review Mode</Label>
                          <div className="flex gap-2">
                            <Button 
                              variant={reviewMode === 'standard' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setReviewMode('standard')}
                            >
                              Standard
                            </Button>
                            <Button 
                              variant={reviewMode === 'learning' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setReviewMode('learning')}
                            >
                              Learning
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {reviewMode === 'standard' ? 
                            'Standard mode shows question and answer separately' :
                            'Learning mode shows both question and answer at once'}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shuffle">Shuffle Cards</Label>
                          <Switch 
                            id="shuffle" 
                            checked={shuffleCards} 
                            onCheckedChange={setShuffleCards}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="progress">Show Progress</Label>
                          <Switch 
                            id="progress" 
                            checked={showProgress} 
                            onCheckedChange={setShowProgress}
                          />
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                  
                  <FlashcardComponent
                    card={cards[currentCardIndex]}
                    mode={reviewMode}
                    onCardAction={handleCardAction}
                    showControls={true}
                    showConfidence={true}
                  />
                  
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    Card {currentCardIndex + 1} of {cards.length}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center flex-col">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No cards in this deck yet</p>
                  <Button asChild>
                    <Link href="/flashcards/create">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Flashcards
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* List Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Flashcard List</CardTitle>
              <CardDescription>
                View and manage all flashcards in this deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cards.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cards.map((card, index) => (
                    <div key={card.id} className="py-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{card.question}</h3>
                        <div className="flex items-center">
                          <Badge variant="outline" className="ml-2">
                            {card.confidenceLevel ? '★'.repeat(card.confidenceLevel) : 'Not reviewed'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{card.answer}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Last reviewed: {formatTimeAgo(card.lastReviewed)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No cards in this deck yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/flashcards/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Cards
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Study Statistics</CardTitle>
              <CardDescription>
                Track your progress and performance with this deck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{cards.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{completedCards.size}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Reviewed Cards</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">
                    {completedCards.size > 0 ? `${progressPercentage}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
                </div>
              </div>
              
              {cards.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium mb-3">Confidence Distribution</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(level => {
                      const cardsWithLevel = cards.filter(card => card.confidenceLevel === level);
                      const percentage = cards.length > 0 
                        ? Math.round((cardsWithLevel.length / cards.length) * 100)
                        : 0;
                      
                      return (
                        <div key={level} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{level === 5 ? 'Perfect' : level === 1 ? 'Not at all' : `Level ${level}`}</span>
                            <span>{cardsWithLevel.length} cards ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    
                    {/* Cards without confidence level */}
                    {(() => {
                      const unreviewed = cards.filter(card => !card.confidenceLevel);
                      const percentage = cards.length > 0 
                        ? Math.round((unreviewed.length / cards.length) * 100)
                        : 0;
                      
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Not yet reviewed</span>
                            <span>{unreviewed.length} cards ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No cards to show statistics for</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" asChild>
          <Link href="/flashcards">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Link>
        </Button>
      </div>
    </div>
  );
}