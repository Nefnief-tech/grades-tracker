/**
 * Debug utilities for inspecting and fixing flashcard data
 */

interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  cards: FlashcardItem[];
  createdAt: string;
  lastModified: string;
  version?: number;
  type?: string;
  settings?: any;
}

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  proficiency: number;
  nextReview: string;
  history: any[];
  createdAt: string;
  tags: string[];
}

export const flashcardDebugUtils = {
  /**
   * Inspect the flashcards in localStorage
   */
  inspectLocalStorage: (): boolean => {
    if (typeof window === 'undefined') {
      console.log('Running in server context, no localStorage available');
      return false;
    }
    
    console.log('=== LOCAL STORAGE INSPECTION ===');
    
    // List all keys
    const keys = Object.keys(localStorage);
    console.log(`Total items in localStorage: ${keys.length}`);
    
    // Check for flashcard-related keys
    const flashcardKeys = keys.filter(key => 
      key === 'flashcards' || 
      key.startsWith('flashcard') || 
      key.startsWith('deck')
    );
    
    console.log('Flashcard-related keys:', flashcardKeys);
    
    // Check specifically for the main flashcards key
    try {
      const flashcardsStr = localStorage.getItem('flashcards');
      if (flashcardsStr) {
        const flashcards = JSON.parse(flashcardsStr);
        console.log(`Flashcards found! Total decks: ${flashcards.length}`);
        
        // Show basic deck structure
        flashcards.forEach((deck: FlashcardDeck, i: number) => {
          console.log(`Deck ${i + 1}: ${deck.name} (${deck.id})`);
          console.log(`  - Cards: ${deck.cards?.length || 0}`);
          console.log(`  - Created: ${deck.createdAt}`);
        });
      } else {
        console.log('No flashcards key found in localStorage');
      }
    } catch (e) {
      console.error('Error parsing flashcards data:', e);
    }
    
    console.log('================================');
    
    return true;
  },
  
  /**
   * Check if a deck is compatible with the flashcard routes
   */
  checkFlashcardRouteCompatibility: (deckId?: string) => {
    if (typeof window === 'undefined') return { compatible: false, issues: ['Server-side execution'] };
    
    try {
      // Get flashcards data
      const flashcardsStr = localStorage.getItem('flashcards');
      if (!flashcardsStr) {
        return { compatible: false, issues: ['No flashcards in localStorage'] };
      }
      
      const allDecks = JSON.parse(flashcardsStr);
      if (!Array.isArray(allDecks) || allDecks.length === 0) {
        return { compatible: false, issues: ['No decks available'] };
      }
      
      // If no specific deck ID provided, check the first deck
      const deck = deckId 
        ? allDecks.find((d: any) => d.id === deckId) 
        : allDecks[0];
        
      if (!deck) {
        return { compatible: false, issues: ['Deck not found'] };
      }
      
      // Check required properties for route compatibility
      const issues: string[] = [];
      
      if (!deck.id) issues.push('Missing deck ID');
      if (!deck.name) issues.push('Missing deck name');
      if (!deck.cards) issues.push('Missing cards array');
      if (!Array.isArray(deck.cards)) issues.push('Cards is not an array');
      
      // Check individual cards if they exist
      if (deck.cards && Array.isArray(deck.cards) && deck.cards.length > 0) {
        // Check first card for required properties
        const firstCard = deck.cards[0];
        if (!firstCard.id) issues.push('Card missing ID');
        if (firstCard.front === undefined) issues.push('Card missing front');
        if (firstCard.back === undefined) issues.push('Card missing back');
        
        // Check for potential route-specific requirements
        if (firstCard.proficiency === undefined) issues.push('Card missing proficiency (may be required)');
        if (!firstCard.nextReview) issues.push('Card missing nextReview (may be required)');
      } else if (deck.cards && Array.isArray(deck.cards)) {
        issues.push('Deck has no cards');
      }
      
      // Log findings
      if (issues.length > 0) {
        console.warn(`Deck ${deck.id} has compatibility issues:`, issues);
      } else {
        console.log(`Deck ${deck.id} appears to be compatible with flashcard routes`);
      }
      
      return {
        compatible: issues.length === 0,
        issues,
        deck
      };
    } catch (e) {
      return {
        compatible: false,
        issues: [`Error checking compatibility: ${e instanceof Error ? e.message : String(e)}`]
      };
    }
  },
  
  /**
   * Create a sample flashcard deck for testing
   */
  createSampleDeck: (): FlashcardDeck | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const deckId = `sample-${Date.now()}`;
      const now = new Date().toISOString();
      
      // Create a properly formatted deck with all required fields
      const sampleDeck: FlashcardDeck = {
        id: deckId,
        name: 'Sample Vocabulary',
        description: 'Sample deck created for testing',
        cards: [
          {
            id: `card-${Date.now()}-1`,
            front: 'der Hund',
            back: 'dog',
            proficiency: 0,
            nextReview: now,
            history: [],
            createdAt: now,
            tags: ['sample']
          },
          {
            id: `card-${Date.now()}-2`,
            front: 'die Katze',
            back: 'cat',
            proficiency: 0,
            nextReview: now,
            history: [],
            createdAt: now,
            tags: ['sample']
          },
          {
            id: `card-${Date.now()}-3`,
            front: 'das Auto',
            back: 'car',
            proficiency: 0,
            nextReview: now,
            history: [],
            createdAt: now,
            tags: ['sample']
          }
        ],
        createdAt: now,
        lastModified: now,
        version: 1,
        type: "standard",
        settings: {
          reviewsPerSession: 10,
          showDefinitionFirst: false
        }
      };
      
      // Save to localStorage
      const flashcardsStr = localStorage.getItem('flashcards');
      let allDecks: FlashcardDeck[] = [];
      
      if (flashcardsStr) {
        try {
          const parsed = JSON.parse(flashcardsStr);
          if (Array.isArray(parsed)) {
            allDecks = parsed;
          }
        } catch (e) {
          console.error('Error parsing existing flashcards:', e);
        }
      }
      
      allDecks.push(sampleDeck);
      localStorage.setItem('flashcards', JSON.stringify(allDecks));
      
      console.log(`Sample deck created: ${sampleDeck.name} (${deckId})`);
      return sampleDeck;
    } catch (e) {
      console.error('Error creating sample deck:', e);
      return null;
    }
  },
  
  /**
   * Fix common issues with existing flashcard data
   */
  repairFlashcardData: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const flashcardsStr = localStorage.getItem('flashcards');
      if (!flashcardsStr) {
        console.log('No flashcards data to repair');
        return false;
      }
      
      const decks = JSON.parse(flashcardsStr);
      if (!Array.isArray(decks)) {
        console.log('Flashcards data is not an array, cannot repair');
        return false;
      }
      
      let repaired = false;
      
      // Process each deck
      decks.forEach((deck: any) => {
        if (!deck.cards) {
          console.log(`Repairing missing cards array in deck ${deck.id}`);
          deck.cards = [];
          repaired = true;
        }
        
        if (!deck.createdAt) {
          deck.createdAt = new Date().toISOString();
          repaired = true;
        }
        
        if (!deck.lastModified) {
          deck.lastModified = new Date().toISOString();
          repaired = true;
        }
        
        // Add version and type
        if (!deck.version) {
          deck.version = 1;
          repaired = true;
        }
        
        if (!deck.type) {
          deck.type = "standard";
          repaired = true;
        }
        
        if (!deck.settings) {
          deck.settings = {
            reviewsPerSession: 10,
            showDefinitionFirst: false
          };
          repaired = true;
        }
        
        // Fix cards
        if (Array.isArray(deck.cards)) {
          deck.cards.forEach((card: any) => {
            if (!card.id) {
              card.id = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              repaired = true;
            }
            
            if (card.proficiency === undefined) {
              card.proficiency = 0;
              repaired = true;
            }
            
            if (!card.nextReview) {
              card.nextReview = new Date().toISOString();
              repaired = true;
            }
            
            if (!card.history) {
              card.history = [];
              repaired = true;
            }
            
            if (!card.tags) {
              card.tags = [];
              repaired = true;
            }
            
            // Ensure front and back exist
            if (!card.front && (card.term || card.question)) {
              card.front = card.term || card.question;
              repaired = true;
            }
            
            if (!card.back && (card.definition || card.answer)) {
              card.back = card.definition || card.answer;
              repaired = true;
            }
          });
        }
      });
      
      if (repaired) {
        localStorage.setItem('flashcards', JSON.stringify(decks));
        console.log('Flashcard data repaired successfully');
      } else {
        console.log('No repairs needed for flashcard data');
      }
      
      return repaired;
    } catch (e) {
      console.error('Error repairing flashcard data:', e);
      return false;
    }
  }
};

export default flashcardDebugUtils;