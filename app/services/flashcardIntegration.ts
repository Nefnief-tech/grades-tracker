// Flashcard Integration Service - Ensures compatibility with the app's flashcard system

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  createdAt: string; // ISO date string
  lastReviewed?: string; // ISO date string
  proficiency: number;
  nextReview: string; // ISO date string
  history: any[];
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: string; // ISO date string
  lastModified: string; // ISO date string
}

// Generate a unique ID for a new card
const generateCardId = () => `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Format the current date as ISO string
const nowAsISOString = () => new Date().toISOString();

// The flashcard integration service
export const flashcardIntegration = {
  // Get all existing decks
  getDecks: (): Deck[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const decksStr = localStorage.getItem('flashcards');
      if (!decksStr) return [];
      
      const decks = JSON.parse(decksStr);
      return Array.isArray(decks) ? decks : [];
    } catch (e) {
      console.error('Error getting flashcard decks:', e);
      return [];
    }
  },
  
  // Create a new deck
  createDeck: (name: string, description: string = 'Created from vocabulary extractor'): Deck => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      cards: [],
      createdAt: nowAsISOString(),
      lastModified: nowAsISOString()
    };
    
    const existingDecks = flashcardIntegration.getDecks();
    const updatedDecks = [...existingDecks, newDeck];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('flashcards', JSON.stringify(updatedDecks));
    }
    
    return newDeck;
  },
  
  // Get a specific deck by ID
  getDeck: (deckId: string): Deck | null => {
    const decks = flashcardIntegration.getDecks();
    return decks.find(d => d.id === deckId) || null;
  },
  
  // Create flashcards from vocabulary terms
  createFlashcardsFromVocabulary: (
    deckId: string, 
    vocabulary: Array<{term?: string; definition?: string; word?: string; translation?: string; [key: string]: any}>
  ): Flashcard[] => {
    // Find the right field names
    const getFieldNames = (item: any) => {
      if (item.term && item.definition) {
        return { front: 'term', back: 'definition' };
      }
      if (item.word && item.translation) {
        return { front: 'word', back: 'translation' };
      }
      const keys = Object.keys(item);
      return { front: keys[0] || '', back: keys[1] || '' };
    };
    
    // Create the flashcard objects
    const flashcards = vocabulary.map(item => {
      const { front, back } = getFieldNames(item);
      
      return {
        id: generateCardId(),
        front: item[front] || '',
        back: item[back] || '',
        tags: ['vocabulary-extractor'],
        createdAt: nowAsISOString(),
        proficiency: 0,
        nextReview: nowAsISOString(),
        history: []
      };
    });
    
    return flashcards;
  },
  
  // Add flashcards to a deck
  addFlashcardsToDeck: (deckId: string, flashcards: Flashcard[]): boolean => {
    try {
      const decks = flashcardIntegration.getDecks();
      const deckIndex = decks.findIndex(d => d.id === deckId);
      
      if (deckIndex === -1) {
        console.error(`Deck with ID ${deckId} not found`);
        return false;
      }
      
      // Add cards to deck
      decks[deckIndex].cards = [
        ...decks[deckIndex].cards,
        ...flashcards
      ];
      decks[deckIndex].lastModified = nowAsISOString();
      
      // Save updated decks
      localStorage.setItem('flashcards', JSON.stringify(decks));
      console.log(`Added ${flashcards.length} flashcards to deck "${decks[deckIndex].name}"`);
      return true;
    } catch (e) {
      console.error('Error adding flashcards to deck:', e);
      return false;
    }
  },
  
  // Process vocabulary items and add them to a deck (new or existing)  saveVocabularyAsDeck: async (
    vocabulary: Array<{term?: string; definition?: string; word?: string; translation?: string; [key: string]: any}>,
    deckName?: string,
    deckId?: string
  ): Promise<{success: boolean, deckId: string, message: string}> => {
    try {
      console.log(`Creating flashcards from ${vocabulary.length} vocabulary items`);
      
      // Examine existing flashcard structure first
      const existingDataStr = localStorage.getItem('flashcards');
      console.log(`Existing flashcard data found: ${!!existingDataStr}`);
      
      // Determine the target deck
      let targetDeckId = deckId;
      let decks = existingDataStr ? JSON.parse(existingDataStr) : [];
      
      if (!Array.isArray(decks)) {
        console.warn("Existing flashcard data is not an array, resetting");
        decks = [];
      }
      
      if (!targetDeckId && deckName) {
        // Create a new deck with the exact expected structure
        targetDeckId = `deck-${Date.now()}`;
        console.log(`Creating new deck: ${deckName} (${targetDeckId})`);
      } else if (targetDeckId) {
        // Verify the deck exists
        const deckExists = decks.some((d: any) => d.id === targetDeckId);
        if (!deckExists) {
          console.error(`Deck ${targetDeckId} not found`);
          return {
            success: false,
            deckId: '',
            message: `Deck with ID ${targetDeckId} not found`
          };
        }
        console.log(`Using existing deck: ${targetDeckId}`);
      } else {
        return {
          success: false,
          deckId: '',
          message: 'Either deckId or deckName must be provided'
        };
      }
      
      // Create flashcards with the exact format expected by the app
      const now = new Date().toISOString();
      const flashcards = vocabulary.map((item, index) => {
        // Find the right field names for term/definition
        const term = item.term || item.word || Object.values(item)[0] || '';
        const definition = item.definition || item.translation || Object.values(item)[1] || '';
        
        return {
          id: `card-${Date.now()}-${index}`,
          front: term,
          back: definition,
          proficiency: 0,
          nextReview: now,
          history: [],
          createdAt: now,
          tags: ['vocabulary-extractor']
        };
      });
      
      console.log(`Created ${flashcards.length} flashcards`);
      
      // Either update existing deck or create new one
      if (deckName && !deckId) {
        // Create new deck
        const newDeck = {
          id: targetDeckId,
          name: deckName,
          description: 'Created from vocabulary extractor',
          cards: flashcards,
          createdAt: now,
          lastModified: now
        };
        
        decks.push(newDeck);
        console.log(`Added new deck to collection: ${deckName}`);
      } else {
        // Update existing deck
        const deckIndex = decks.findIndex((d: any) => d.id === targetDeckId);
        
        if (!decks[deckIndex].cards) {
          decks[deckIndex].cards = [];
        }
        
        decks[deckIndex].cards = [...decks[deckIndex].cards, ...flashcards];
        decks[deckIndex].lastModified = now;
        console.log(`Updated existing deck with ${flashcards.length} cards`);
      }
      
      // Save the updated flashcards collection
      localStorage.setItem('flashcards', JSON.stringify(decks));
      console.log('Saved flashcards to localStorage');
      
      return {
        success: true,
        deckId: targetDeckId!,
        message: `Added ${flashcards.length} flashcards to deck`
      };
    } catch (e) {
      console.error('Error saving vocabulary as deck:', e);
      return {
        success: false,
        deckId: '',
        message: `Error: ${e instanceof Error ? e.message : String(e)}`
      };
    }
  }
};

export default flashcardIntegration;