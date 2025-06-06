/**
 * Flashcard Filter Utility
 * Handles filtering and validation of flashcards from API responses
 */
import { FlashcardSubmission } from "@/types/flashcards";

/**
 * Filter out problematic flashcards that might cause issues
 */
export function filterProblematicFlashcards(flashcards: FlashcardSubmission[]): FlashcardSubmission[] {
  if (!flashcards || !Array.isArray(flashcards)) {
    return [];
  }

  return flashcards.filter(card => {
    // Check if card has required fields
    if (!card || typeof card !== 'object') return false;
    if (!card.question || !card.answer) return false;
    
    // Check if question and answer are valid strings
    if (typeof card.question !== 'string' || typeof card.answer !== 'string') return false;
    
    // Check if question and answer are not empty
    if (card.question.trim() === '' || card.answer.trim() === '') return false;
    
    // Verify tags field is valid
    if (card.tags !== undefined) {
      if (!Array.isArray(card.tags)) return false;
      
      // Ensure all tags are strings
      if (card.tags.some(tag => typeof tag !== 'string')) return false;
    }
    
    return true;
  });
}

/**
 * Validate and normalize flashcards to ensure consistent format
 */
export function normalizeFlashcards(flashcards: FlashcardSubmission[]): FlashcardSubmission[] {
  if (!flashcards || !Array.isArray(flashcards)) {
    return [];
  }

  return flashcards.map(card => {
    // Create a copy of the card to avoid mutating the original
    const normalizedCard: FlashcardSubmission = {
      question: card.question.trim(),
      answer: card.answer.trim(),
      tags: []
    };
    
    // Normalize tags if present
    if (card.tags && Array.isArray(card.tags)) {
      normalizedCard.tags = card.tags
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim());
    }
    
    return normalizedCard;
  });
}

/**
 * Process flashcards from API response and ensure they are valid
 */
export function processFlashcards(flashcards: any): FlashcardSubmission[] {
  // First, ensure we have an array
  let cards: FlashcardSubmission[] = Array.isArray(flashcards) 
    ? flashcards 
    : [];
  
  // Filter out problematic cards
  cards = filterProblematicFlashcards(cards);
  
  // Normalize remaining cards
  cards = normalizeFlashcards(cards);
  
  return cards;
}

export default {
  filterProblematicFlashcards,
  normalizeFlashcards,
  processFlashcards
};