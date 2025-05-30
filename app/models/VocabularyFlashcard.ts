/**
 * Vocabulary system types
 */

// Single vocabulary term
export interface VocabularyTerm {
  id: string;
  term: string;
  definition: string;
  proficiency: number; // 0-5, where 0 is not known and 5 is fully mastered
  lastReviewed?: string; // ISO date string
  nextReview: string;    // ISO date string
  history: ReviewRecord[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
  examples?: string[];
  
  // Additional language-specific properties
  partOfSpeech?: string;
  gender?: string;       // e.g., masculine, feminine, neuter
  plural?: string;
  conjugation?: string;
}

// Vocabulary review record
export interface ReviewRecord {
  date: string;          // ISO date string
  knewAnswer: boolean;   // Did the user know the answer?
  responseTime?: number; // Response time in milliseconds
  proficiencyBefore: number;
  proficiencyAfter: number;
}

// Vocabulary deck statistics
export interface VocabularyStats {
  totalTerms: number;
  mastered: number;      // Proficiency level 5
  learning: number;      // Proficiency 1-4
  new: number;           // Proficiency 0
  dueForReview: number;  // Terms due for review
  lastStudied?: string;  // ISO date string
}

// Vocabulary learning settings
export interface VocabularySettings {
  dailyLimit: number;    // Maximum number of terms to learn per day
  reviewThreshold: {
    [proficiency: number]: number; // Hours until next review for each proficiency level
  };
  reviewIncrement: {
    [proficiency: number]: number; // Amount to increase proficiency when correct
  };
  reviewDecrement: {
    [proficiency: number]: number; // Amount to decrease proficiency when incorrect
  };
}

// Complete vocabulary deck
export interface VocabularyDeck {
  id: string;
  name: string;
  description: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  terms: VocabularyTerm[];
  stats?: VocabularyStats;
  settings?: VocabularySettings;
  owner?: string;
  shared?: boolean;
}

// Default review settings
export const DEFAULT_VOCABULARY_SETTINGS: VocabularySettings = {
  dailyLimit: 20,
  // Hours until next review: level 0: 1hr, level 1: 4hrs, level 2: 8hrs, etc.
  reviewThreshold: {
    0: 1,      // 1 hour
    1: 4,      // 4 hours
    2: 8,      // 8 hours
    3: 24,     // 1 day
    4: 72,     // 3 days
    5: 168     // 7 days
  },
  // Increase proficiency by this amount when correct
  reviewIncrement: {
    0: 1,
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 0
  },
  // Decrease proficiency by this amount when incorrect
  reviewDecrement: {
    0: 0,
    1: 1,
    2: 1,
    3: 1,
    4: 2,
    5: 1
  }
};