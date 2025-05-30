'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { VocabularyService } from '@/app/services/VocabularyService';
import { VocabularyDeck, VocabularyTerm } from '@/app/models/VocabularyFlashcard';

export default function DeckStatsPage() {
  const router = useRouter();
  const { deckId } = useParams() as { deckId: string };
  const [deck, setDeck] = useState<VocabularyDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!deckId) return;
    
    const loadDeck = () => {
      try {
        const deckData = VocabularyService.getDeck(deckId);
        setDeck(deckData);
      } catch (error) {
        console.error('Failed to load vocabulary deck:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeck();
  }, [deckId]);
  
  // Group terms by proficiency level
  const getProficiencyGroups = () => {
    if (!deck) return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    const groups = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    deck.terms.forEach(term => {
      if (term.proficiency >= 0 && term.proficiency <= 5) {
        groups[term.proficiency as keyof typeof groups]++;
      }
    });
    
    return groups;
  };
  
  const proficiencyGroups = getProficiencyGroups();
  
  // Calculate percentage of mastery
  const calculateMasteryPercentage = () => {
    if (!deck || deck.terms.length === 0) return 0;
    
    const mastered = deck.terms.filter(term => term.proficiency >= 4).length;
    return (mastered / deck.terms.length) * 100;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Deck Statistics</h1>
        <p>Loading statistics...</p>
      </div>
    );
  }
  
  if (!deck) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Deck Statistics</h1>
        <p>Deck not found</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/vocabulary/stats')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Statistics
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deck Statistics: {deck.name}</h1>
        <Button variant="outline" onClick={() => router.push('/vocabulary/stats')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Statistics
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mastery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Mastery</span>
              <span className="font-bold">{Math.round(calculateMasteryPercentage())}%</span>
            </div>
            <Progress value={calculateMasteryPercentage()} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Proficiency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(proficiencyGroups).map(([level, count]) => (
                <div key={level} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Level {level} ({getProficiencyLabel(Number(level))})
                    </span>
                    <span>{count} terms</span>
                  </div>
                  <Progress 
                    value={(count / deck.terms.length) * 100} 
                    className={`h-2 ${getProficiencyColor(Number(level))}`} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deck Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Total Terms</dt>
                <dd>{deck.terms.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Mastered</dt>
                <dd>{deck.stats?.mastered || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Learning</dt>
                <dd>{deck.stats?.learning || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">New</dt>
                <dd>{deck.stats?.new || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Created</dt>
                <dd>{formatDate(deck.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Last Updated</dt>
                <dd>{formatDate(deck.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Term Details</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/vocabulary/study/${deckId}`)}>
            Study Deck
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-4 pr-4 font-medium">Term</th>
                  <th className="text-left pb-4 pr-4 font-medium">Definition</th>
                  <th className="text-left pb-4 pr-4 font-medium">Proficiency</th>
                  <th className="text-left pb-4 pr-4 font-medium">Last Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deck.terms.map((term) => (
                  <tr key={term.id} className="hover:bg-muted/50">
                    <td className="py-3 pr-4">{term.term}</td>
                    <td className="py-3 pr-4">{term.definition}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getProficiencyColor(term.proficiency)}`}></div>
                        <span>{term.proficiency} ({getProficiencyLabel(term.proficiency)})</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {term.lastReviewed ? formatDate(term.lastReviewed) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getProficiencyLabel(level: number): string {
  switch (level) {
    case 0: return 'New';
    case 1: return 'Learning';
    case 2: return 'Familiar';
    case 3: return 'Known';
    case 4: return 'Well Known';
    case 5: return 'Mastered';
    default: return 'Unknown';
  }
}

function getProficiencyColor(level: number): string {
  switch (level) {
    case 0: return 'bg-blue-500';
    case 1: return 'bg-sky-400';
    case 2: return 'bg-yellow-500';
    case 3: return 'bg-amber-500';
    case 4: return 'bg-lime-500';
    case 5: return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return 'Invalid date';
  }
}