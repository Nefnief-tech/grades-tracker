'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BarChart, PieChart, LineChart } from 'lucide-react';
import { VocabularyService } from '@/app/services/VocabularyService';
import { VocabularyDeck } from '@/app/models/VocabularyFlashcard';

export default function VocabularyStatsPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load all decks
    const loadDecks = () => {
      try {
        const allDecks = VocabularyService.getAllDecks();
        setDecks(allDecks);
      } catch (error) {
        console.error('Failed to load vocabulary decks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDecks();
  }, []);
  
  // Calculate overall statistics
  const calculateOverallStats = () => {
    let totalTerms = 0;
    let mastered = 0;
    let learning = 0;
    let newTerms = 0;
    
    decks.forEach(deck => {
      if (deck.stats) {
        totalTerms += deck.stats.totalTerms || 0;
        mastered += deck.stats.mastered || 0;
        learning += deck.stats.learning || 0;
        newTerms += deck.stats.new || 0;
      }
    });
    
    return { totalTerms, mastered, learning, new: newTerms };
  };
  
  const overallStats = calculateOverallStats();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Vocabulary Statistics</h1>
        <p>Loading statistics...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocabulary Statistics</h1>
        <Button variant="outline" onClick={() => router.push('/vocabulary/study')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vocabulary
        </Button>
      </div>
      
      {decks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PieChart className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Vocabulary Data</h2>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any vocabulary decks yet.
              Start by creating a deck and adding vocabulary terms.
            </p>
            <Button onClick={() => router.push('/vocabulary/create')}>
              Create Your First Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">{overallStats.totalTerms}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mastered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-green-500 mr-2" />
                  <div className="text-2xl font-bold">{overallStats.mastered}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-amber-500 mr-2" />
                  <div className="text-2xl font-bold">{overallStats.learning}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{overallStats.new}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-8" />
          
          <h2 className="text-2xl font-bold mb-4">Decks Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {decks.map(deck => (
              <Card key={deck.id}>
                <CardHeader>
                  <CardTitle>{deck.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-secondary rounded-md p-2">
                        <p className="font-bold">{deck.stats?.totalTerms || 0}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="bg-secondary rounded-md p-2">
                        <p className="font-bold text-green-500">{deck.stats?.mastered || 0}</p>
                        <p className="text-xs text-muted-foreground">Mastered</p>
                      </div>
                      <div className="bg-secondary rounded-md p-2">
                        <p className="font-bold text-amber-500">{deck.stats?.learning || 0}</p>
                        <p className="text-xs text-muted-foreground">Learning</p>
                      </div>
                      <div className="bg-secondary rounded-md p-2">
                        <p className="font-bold text-blue-500">{deck.stats?.new || 0}</p>
                        <p className="text-xs text-muted-foreground">New</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/vocabulary/study/${deck.id}`)}
                      >
                        Study
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/vocabulary/stats/${deck.id}`)}
                      >
                        Detailed Stats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}