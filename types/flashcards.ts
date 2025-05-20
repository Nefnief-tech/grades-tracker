/**
 * Types for the flashcard system
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  lastReviewed?: string;
  timesReviewed?: number;
  // For spaced repetition
  nextReviewDate?: string;
  confidenceLevel?: number; // 1-5
  // For organization
  tags?: string[];
  deckId: string;
  // AI generation metadata
  model?: string;
  generatedBy?: 'ai' | 'user' | 'import';
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastOpened?: string;
  cardCount: number;
  tags?: string[];
  color?: string;
}

export interface FlashcardSubmission {
  question: string;
  answer: string;
  tags?: string[];
  model?: string;
  generatedBy?: 'ai' | 'user' | 'import';
}

export interface FlashcardQuery {
  deckId?: string;
  tags?: string[];
  confidenceLevel?: number;
  reviewDue?: boolean;
  searchQuery?: string;
  limit?: number;
  randomize?: boolean;
}

export interface FlashcardAction {
  type: 'create' | 'update' | 'delete' | 'mark-reviewed';
  payload: any;
}

export type ReviewMode = 'standard' | 'learning' | 'quiz' | 'spaced';

export interface ReviewSettings {
  mode: ReviewMode;
  shuffleCards: boolean;
  showProgress: boolean;
  autoPlayInterval?: number; // milliseconds, if auto-playing
}