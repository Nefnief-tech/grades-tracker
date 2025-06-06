/**
 * Service for handling vocabulary decks and terms
 */
import { VocabularyDeck, VocabularyTerm, VocabularyStats, DEFAULT_VOCABULARY_SETTINGS } from "@/app/models/VocabularyFlashcard";

// Local storage key
const VOCABULARY_STORAGE_KEY = "vocabulary-decks";

export class VocabularyService {
  /**
   * Get all vocabulary decks
   */
  static getAllDecks(): VocabularyDeck[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const decksStr = localStorage.getItem(VOCABULARY_STORAGE_KEY);
      if (!decksStr) return [];
      
      const decks = JSON.parse(decksStr);
      return Array.isArray(decks) ? decks : [];
    } catch (e) {
      console.error('Failed to get vocabulary decks:', e);
      return [];
    }
  }
  
  /**
   * Get a specific vocabulary deck by ID
   */
  static getDeck(deckId: string): VocabularyDeck | null {
    const decks = this.getAllDecks();
    return decks.find(deck => deck.id === deckId) || null;
  }
  
  /**
   * Create a new vocabulary deck
   */
  static createDeck(name: string, description: string = "", language: string = ""): VocabularyDeck {
    const now = new Date().toISOString();
    const newDeck: VocabularyDeck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      language,
      createdAt: now,
      updatedAt: now,
      terms: [],
      stats: {
        totalTerms: 0,
        mastered: 0,
        learning: 0,
        new: 0,
        dueForReview: 0
      },
      settings: DEFAULT_VOCABULARY_SETTINGS
    };
    
    // Save the new deck
    const decks = this.getAllDecks();
    decks.push(newDeck);
    this.saveDecks(decks);
    
    return newDeck;
  }
  
  /**
   * Delete a vocabulary deck
   */
  static deleteDeck(deckId: string): boolean {
    const decks = this.getAllDecks();
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    
    if (updatedDecks.length !== decks.length) {
      this.saveDecks(updatedDecks);
      return true;
    }
    
    return false;
  }
  
  /**
   * Add a new term to a deck
   */
  static addTerm(deckId: string, term: string, definition: string): VocabularyTerm | null {
    const decks = this.getAllDecks();
    const deckIndex = decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex === -1) return null;
    
    const now = new Date().toISOString();
    const newTerm: VocabularyTerm = {
      id: `term-${Date.now()}`,
      term,
      definition,
      proficiency: 0,
      nextReview: now,
      history: [],
      createdAt: now,
      updatedAt: now
    };
    
    // Add the term to the deck
    decks[deckIndex].terms.push(newTerm);
    decks[deckIndex].updatedAt = now;
    
    // Update stats
    this.updateDeckStats(decks[deckIndex]);
    
    // Save changes
    this.saveDecks(decks);
    
    return newTerm;
  }
  
  /**
   * Import vocabulary terms from the extractor
   */
  static importFromExtractor(deckId: string, extractedItems: Array<{term?: string; definition?: string; word?: string; translation?: string; [key: string]: any}>): VocabularyTerm[] {
    const decks = this.getAllDecks();
    const deckIndex = decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex === -1) return [];
    
    const now = new Date().toISOString();
    const newTerms: VocabularyTerm[] = [];
    
    // Process each extracted item
    extractedItems.forEach(item => {
      const term = item.term || item.word || '';
      const definition = item.definition || item.translation || '';
      
      if (term && definition) {
        // Check if the term already exists in this deck
        const termExists = decks[deckIndex].terms.some(
          existingTerm => existingTerm.term.toLowerCase() === term.toLowerCase()
        );
        
        if (!termExists) {
          const newTerm: VocabularyTerm = {
            id: `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            term,
            definition,
            proficiency: 0,
            nextReview: now,
            history: [],
            createdAt: now,
            updatedAt: now
          };
          
          decks[deckIndex].terms.push(newTerm);
          newTerms.push(newTerm);
        }
      }
    });
    
    if (newTerms.length > 0) {
      // Update deck metadata
      decks[deckIndex].updatedAt = now;
      
      // Update stats
      this.updateDeckStats(decks[deckIndex]);
      
      // Save changes
      this.saveDecks(decks);
    }
    
    return newTerms;
  }
  
  /**
   * Update a term's proficiency based on study results
   */
  static updateTermProficiency(deckId: string, termId: string, knewAnswer: boolean): boolean {
    const decks = this.getAllDecks();
    const deckIndex = decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex === -1) return false;
    
    const termIndex = decks[deckIndex].terms.findIndex(term => term.id === termId);
    
    if (termIndex === -1) return false;
    
    const now = new Date().toISOString();
    const term = decks[deckIndex].terms[termIndex];
    const currentProficiency = term.proficiency;
    
    // Calculate new proficiency
    let newProficiency: number;
    
    if (knewAnswer) {
      // Increase proficiency (but cap at 5)
      const increment = decks[deckIndex].settings?.reviewIncrement[currentProficiency] || 1;
      newProficiency = Math.min(5, currentProficiency + increment);
    } else {
      // Decrease proficiency (but not below 0)
      const decrement = decks[deckIndex].settings?.reviewDecrement[currentProficiency] || 1;
      newProficiency = Math.max(0, currentProficiency - decrement);
    }
    
    // Create review record
    const reviewRecord = {
      date: now,
      knewAnswer,
      proficiencyBefore: currentProficiency,
      proficiencyAfter: newProficiency
    };
    
    // Update the term
    term.proficiency = newProficiency;
    term.lastReviewed = now;
    term.updatedAt = now;
    term.history.push(reviewRecord);
    
    // Calculate next review time based on new proficiency
    const hoursUntilReview = decks[deckIndex].settings?.reviewThreshold[newProficiency] || 24;
    const nextReviewDate = new Date();
    nextReviewDate.setHours(nextReviewDate.getHours() + hoursUntilReview);
    term.nextReview = nextReviewDate.toISOString();
    
    // Update deck stats
    this.updateDeckStats(decks[deckIndex]);
    
    // Save changes
    this.saveDecks(decks);
    
    return true;
  }
  
  /**
   * Get terms that are due for review from a specific deck
   */
  static getTermsForReview(deckId: string): VocabularyTerm[] {
    const deck = this.getDeck(deckId);
    if (!deck) return [];
    
    const now = new Date();
    
    return deck.terms.filter(term => {
      const nextReview = new Date(term.nextReview);
      return nextReview <= now;
    });
  }
  
  /**
   * Update statistics for a deck
   */
  private static updateDeckStats(deck: VocabularyDeck): void {
    const now = new Date();
    
    const stats: VocabularyStats = {
      totalTerms: deck.terms.length,
      mastered: 0,
      learning: 0,
      new: 0,
      dueForReview: 0
    };
    
    // Calculate stats
    deck.terms.forEach(term => {
      if (term.proficiency === 0) {
        stats.new++;
      } else if (term.proficiency === 5) {
        stats.mastered++;
      } else {
        stats.learning++;
      }
      
      // Check if due for review
      const nextReview = new Date(term.nextReview);
      if (nextReview <= now) {
        stats.dueForReview++;
      }
    });
    
    deck.stats = stats;
  }
  
  /**
   * Save all decks to local storage
   */
  private static saveDecks(decks: VocabularyDeck[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(decks));
    } catch (e) {
      console.error('Failed to save vocabulary decks:', e);
    }
  }
}

export default VocabularyService;