import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Plus, Check, BarChart } from 'lucide-react';
import DecksList from './DecksList';

export default function VocabularyStudyPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocabulary Study</h1>
        <Link href="/vocabulary/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Deck
          </Button>
        </Link>
      </div>

      {/* Client-side component for deck listing */}
      <DecksList />
      
      <Separator className="my-8" />

      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/vocabulary">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <BookOpen className="h-6 w-6 mb-2" />
              <CardTitle>Extract Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Extract vocabulary from textbooks and create new flashcards
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vocabulary/practice">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <Check className="h-6 w-6 mb-2" />
              <CardTitle>Practice All Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review terms from all your vocabulary decks
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vocabulary/stats">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <BarChart className="h-6 w-6 mb-2" />
              <CardTitle>Learning Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your vocabulary learning progress
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}