'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ThumbsUp, ThumbsDown, RefreshCcw } from 'lucide-react';
import { VocabularyService } from '@/app/services/VocabularyService';
import { VocabularyTerm } from '@/app/models/VocabularyFlashcard';

// Custom type for combined term with deck info
interface CombinedVocabularyTerm extends VocabularyTerm {
  deckId: string;
  deckName: string;
}

export default function VocabularyPracticePage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [termsToStudy, setTermsToStudy] = useState<CombinedVocabularyTerm[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0
  });
  
  // Load terms from all decks
  useEffect(() => {
    const loadTerms = () => {
      try {
        // Get all decks
        const allDecks = VocabularyService.getAllDecks();
        
        // Combine terms from all decks
        const combined: CombinedVocabularyTerm[] = [];
        
        allDecks.forEach(deck => {
          if (deck.terms && deck.terms.length > 0) {
            const termsWithDeckInfo = deck.terms.map(term => ({
              ...term,
              deckId: deck.id,
              deckName: deck.name
            }));
            
            combined.push(...termsWithDeckInfo);
          }
        });
        
        // Prioritize terms with low proficiency
        const prioritized = [...combined].sort((a, b) => {
          // First by proficiency level
          if (a.proficiency !== b.proficiency) {
            return a.proficiency - b.proficiency;
          }
          
          // Then by last reviewed date (older first)
          if (a.lastReviewed && b.lastReviewed) {
            return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
          }
          
          // Never reviewed items first
          if (!a.lastReviewed) return -1;
          if (!b.lastReviewed) return 1;
          
          return 0;
        });
        
        // Take only the first 20 terms
        const termsForToday = prioritized.slice(0, 20);
        
        // Shuffle the selected terms
        const shuffled = [...termsForToday].sort(() => 0.5 - Math.random());
        setTermsToStudy(shuffled);
        
        if (shuffled.length === 0) {
          setStudyComplete(true);
        }
      } catch (error) {
        console.error('Failed to load vocabulary terms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTerms();
  }, []);
  
  const handleFlip = () => {
    setShowDefinition(!showDefinition);
  };
  
  const handleResponse = (knewAnswer: boolean) => {
    if (termsToStudy.length === 0) return;
    
    // Update the term's proficiency
    const currentTerm = termsToStudy[currentTermIndex];
    VocabularyService.updateTermProficiency(
      currentTerm.deckId, 
      currentTerm.id, 
      knewAnswer
    );
    
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
    // Reload terms and restart
    const allDecks = VocabularyService.getAllDecks();
    
    // Combine terms from all decks
    const combined: CombinedVocabularyTerm[] = [];
    
    allDecks.forEach(deck => {
      if (deck.terms && deck.terms.length > 0) {
        const termsWithDeckInfo = deck.terms.map(term => ({
          ...term,
          deckId: deck.id,
          deckName: deck.name
        }));
        
        combined.push(...termsWithDeckInfo);
      }
    });
    
    // Prioritize and shuffle
    const prioritized = [...combined]
      .sort((a, b) => a.proficiency - b.proficiency)
      .slice(0, 20)
      .sort(() => 0.5 - Math.random());
    
    setTermsToStudy(prioritized);
    setCurrentTermIndex(0);
    setShowDefinition(false);
    setStudyComplete(false);
    setStudyStats({ correct: 0, incorrect: 0 });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Loading vocabulary...</h1>
      </div>
    );
  }
  
  if (termsToStudy.length === 0 && !studyComplete) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Practice All Terms</h1>
          <Button variant="outline" onClick={() => router.push('/vocabulary/study')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Decks
          </Button>
        </div>
        
        <Card className="text-center">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-2xl font-bold mb-4">No Terms Available</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any vocabulary terms to study yet. 
              Add some terms to your vocabulary decks first.
            </p>
            <Button onClick={() => router.push('/vocabulary/create')}>
              Create a Vocabulary Deck
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Practice All Terms</h1>
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
              <p className="text-sm text-muted-foreground">
                From deck: {termsToStudy[currentTermIndex].deckName}
              </p>
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
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Practice mode combines terms from all your vocabulary decks,
          prioritizing the ones you need to review the most.
        </p>
      </div>
    </div>
  );
}