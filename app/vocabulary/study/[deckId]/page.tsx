'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ThumbsUp, ThumbsDown, RefreshCcw } from 'lucide-react';
import { VocabularyService } from '@/app/services/VocabularyService';
import { VocabularyDeck, VocabularyTerm } from '@/app/models/VocabularyFlashcard';

export default function DeckStudyPage() {
  const router = useRouter();
  const { deckId } = useParams() as { deckId: string };
  
  const [deck, setDeck] = useState<VocabularyDeck | null>(null);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [termsToStudy, setTermsToStudy] = useState<VocabularyTerm[]>([]);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0
  });
  
  // Load deck and terms
  useEffect(() => {
    if (!deckId) return;
    
    const loadedDeck = VocabularyService.getDeck(deckId);
    if (loadedDeck) {
      setDeck(loadedDeck);
      
      // Get terms due for review
      const terms = VocabularyService.getTermsForReview(deckId);
      if (terms.length > 0) {
        // Shuffle the terms
        const shuffled = [...terms].sort(() => 0.5 - Math.random());
        // Get the daily limit or all if less than limit
        const dailyLimit = loadedDeck.settings?.dailyLimit || 20;
        const termsForToday = shuffled.slice(0, Math.min(dailyLimit, terms.length));
        
        setTermsToStudy(termsForToday);
      } else {
        // No terms to study
        setStudyComplete(true);
      }
    }
  }, [deckId]);
  
  const handleFlip = () => {
    setShowDefinition(!showDefinition);
  };
  
  const handleResponse = (knewAnswer: boolean) => {
    if (!deck || termsToStudy.length === 0) return;
    
    // Update the term's proficiency
    const currentTerm = termsToStudy[currentTermIndex];
    VocabularyService.updateTermProficiency(deckId, currentTerm.id, knewAnswer);
    
    // Update stats
    setStudyStats(prev => ({
      ...prev,
      correct: prev.correct + (knewAnswer ? 1 : 0),
      incorrect: prev.incorrect + (knewAnswer ? 0 : 1)
    }));
    
    // Move to next term or complete
    if (currentTermIndex < termsToStudy.length - 1) {
      setCurrentTermIndex(prev => prev + 1);
      setShowDefinition(false);
    } else {
      setStudyComplete(true);
    }
  };
  
  const restartStudy = () => {
    if (!deck) return;
    
    const terms = VocabularyService.getTermsForReview(deckId);
    if (terms.length > 0) {
      const shuffled = [...terms].sort(() => 0.5 - Math.random());
      const dailyLimit = deck.settings?.dailyLimit || 20;
      const termsForToday = shuffled.slice(0, Math.min(dailyLimit, terms.length));
      
      setTermsToStudy(termsForToday);
      setCurrentTermIndex(0);
      setShowDefinition(false);
      setStudyComplete(false);
      setStudyStats({ correct: 0, incorrect: 0 });
    }
  };
  
  if (!deck) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading deck...</h1>
        <Button onClick={() => router.push('/vocabulary/study')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vocabulary
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{deck.name}</h1>
        <Button variant="outline" onClick={() => router.push('/vocabulary/study')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Decks
        </Button>
      </div>
      
      {!studyComplete && termsToStudy.length > 0 ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-muted-foreground">
              Term {currentTermIndex + 1} of {termsToStudy.length}
            </p>
            <div className="flex gap-2">
              <span className="text-green-500">{studyStats.correct} correct</span>
              <span className="text-red-500">{studyStats.incorrect} incorrect</span>
            </div>
          </div>
          
          <Progress value={((currentTermIndex) / termsToStudy.length) * 100} className="mb-6" />
          
          <Card className="mb-6">
            <CardHeader className="text-center pb-2">
              <h3 className="text-xl font-semibold">
                {showDefinition ? 'Definition' : 'Term'}
              </h3>
            </CardHeader>
            <CardContent 
              className="text-center py-12 text-2xl cursor-pointer min-h-[200px] flex items-center justify-center"
              onClick={handleFlip}
            >
              {showDefinition 
                ? termsToStudy[currentTermIndex].definition
                : termsToStudy[currentTermIndex].term}
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              Click to flip the card
            </CardFooter>
          </Card>
          
          {showDefinition && (
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => handleResponse(false)}
                variant="outline"
                className="flex-1"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Didn't Know
              </Button>
              <Button 
                onClick={() => handleResponse(true)}
                className="flex-1"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Knew It
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold">Study Complete!</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{studyStats.correct}/{studyStats.correct + studyStats.incorrect}</p>
              <p className="text-muted-foreground">Terms answered correctly</p>
            </div>
            
            <Progress 
              value={studyStats.correct > 0 
                ? (studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100
                : 0
              } 
              className="h-2"
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{studyStats.correct}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{studyStats.incorrect}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={restartStudy}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Study Again
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Separator className="my-8" />
      
      <div className="text-center">
        <h3 className="font-semibold mb-2">Deck Statistics</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold">{deck.stats?.totalTerms || 0}</p>
            <p className="text-xs text-muted-foreground">Total Terms</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold">{deck.stats?.mastered || 0}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold">{deck.stats?.learning || 0}</p>
            <p className="text-xs text-muted-foreground">Learning</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold">{deck.stats?.new || 0}</p>
            <p className="text-xs text-muted-foreground">New</p>
          </div>
        </div>
      </div>
    </div>
  );
}