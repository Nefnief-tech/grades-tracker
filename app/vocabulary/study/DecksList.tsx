'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VocabularyDeck } from '@/app/models/VocabularyFlashcard';
import { VocabularyService } from '@/app/services/VocabularyService';
import { BookOpen, BarChart, Plus, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DecksList() {
  const router = useRouter();
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  const [isDeckListLoaded, setIsDeckListLoaded] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  
  // Load decks only on client side
  useEffect(() => {
    const loadDecks = () => {
      const allDecks = VocabularyService.getAllDecks();
      setDecks(allDecks);
      setIsDeckListLoaded(true);
    };
    
    loadDecks();
  }, []);
  
  const handleStudyDeck = (deckId: string) => {
    router.push(`/vocabulary/study/${deckId}`);
  };
  
  const handleDeleteDeck = (deckId: string) => {
    const result = VocabularyService.deleteDeck(deckId);
    
    if (result) {
      setDecks(decks.filter(deck => deck.id !== deckId));
      toast({
        title: "Deck Deleted",
        description: "The vocabulary deck has been deleted successfully"
      });
    } else {
      toast({
        title: "Deletion Failed",
        description: "Could not delete the vocabulary deck",
        variant: "destructive"
      });
    }
    
    setDeletingDeckId(null);
  };
  
  const calculateMasteryPercentage = (deck: VocabularyDeck) => {
    if (!deck.stats || deck.stats.totalTerms === 0) return 0;
    return (deck.stats.mastered / deck.stats.totalTerms) * 100;
  };
  
  if (!isDeckListLoaded) {
    return <p>Loading decks...</p>;
  }
  
  if (decks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>No Vocabulary Decks</CardTitle>
          <CardDescription>
            You don't have any vocabulary decks yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Create a deck by clicking the "Create New Deck" button or by saving vocabulary from the extractor.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/vocabulary/create')} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create New Deck
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {decks.map(deck => (
          <Card key={deck.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{deck.name}</CardTitle>
                  <CardDescription>{deck.description || 'No description'}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={() => setDeletingDeckId(deck.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Mastery</span>
                  <span>{Math.round(calculateMasteryPercentage(deck))}%</span>
                </div>
                <Progress value={calculateMasteryPercentage(deck)} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-secondary rounded-md p-2">
                  <p className="font-bold">{deck.stats?.totalTerms || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-secondary rounded-md p-2">
                  <p className="font-bold text-green-500">{deck.stats?.mastered || 0}</p>
                  <p className="text-xs text-muted-foreground">Mastered</p>
                </div>
                <div className="bg-secondary rounded-md p-2">
                  <p className="font-bold text-amber-500">{deck.stats?.dueForReview || 0}</p>
                  <p className="text-xs text-muted-foreground">Due</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={() => handleStudyDeck(deck.id)}
                className="flex-1"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Study
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(`/vocabulary/stats/${deck.id}`)}
                className="flex-1"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Stats
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={deletingDeckId !== null} onOpenChange={() => setDeletingDeckId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vocabulary Deck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vocabulary deck? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingDeckId && handleDeleteDeck(deletingDeckId)}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}