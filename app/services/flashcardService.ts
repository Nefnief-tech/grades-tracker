// Flashcard Service for handling flashcard operations

interface Flashcard {
  id?: string;
  front: string;
  back: string;
  tags?: string[];
  createdAt?: Date;
  lastReviewed?: Date;
  deck?: string;
  proficiency?: number;
  nextReview?: Date;
  history?: any[];
}

interface Deck {
  id: string;
  name: string;
  description?: string;
  cardCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to synchronize with the app's native flashcard storage
const syncWithAppStorage = (deckId: string, deckName: string, cards: any[]) => {
  try {
    if (typeof window === 'undefined') return;
    
    // Get existing flashcards from app storage
    const existingDecksStr = localStorage.getItem('flashcards');
    
    if (existingDecksStr) {
      // App already has flashcards, update them
      const allDecks = JSON.parse(existingDecksStr);
      const deckIndex = allDecks.findIndex((d: any) => d.id === deckId);
      
      if (deckIndex >= 0) {
        // Deck exists, update its cards
        if (!allDecks[deckIndex].cards) {
          allDecks[deckIndex].cards = [];
        }
        
        // Add new cards to existing deck
        const existingCardIds = new Set(allDecks[deckIndex].cards.map((c: any) => c.id));
        const uniqueNewCards = cards.filter(card => !existingCardIds.has(card.id));
        
        allDecks[deckIndex].cards = [...allDecks[deckIndex].cards, ...uniqueNewCards];
        allDecks[deckIndex].lastModified = new Date().toISOString();
        
        localStorage.setItem('flashcards', JSON.stringify(allDecks));
        console.log('Updated existing deck in app storage');
      } else {
        // Deck doesn't exist, add it
        allDecks.push({
          id: deckId,
          name: deckName,
          description: 'Created from vocabulary extractor',
          cards: cards,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        });
        localStorage.setItem('flashcards', JSON.stringify(allDecks));
        console.log('Added new deck to app storage');
      }
    } else {
      // No flashcards exist yet in app storage, create initial structure
      const newDeckStructure = [{
        id: deckId,
        name: deckName,
        description: 'Created from vocabulary extractor',
        cards: cards,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }];
      localStorage.setItem('flashcards', JSON.stringify(newDeckStructure));
      console.log('Created initial flashcards structure in app storage');
    }
    return true;
  } catch (e) {
    console.error('Error syncing with app storage:', e);
    return false;
  }
};

// For demo purposes, we're using localStorage
// In a real app, replace with API calls to your backend
export const flashcardService = {
  // Fetch all decks
  getAllDecks: async (): Promise<Deck[]> => {
    try {
      if (typeof window === 'undefined') {
        return [];
      }
      
      const decksJson = localStorage.getItem('flashcardDecks');
      if (!decksJson) {
        return [];
      }
      
      return JSON.parse(decksJson);
    } catch (error) {
      console.error('Failed to get decks:', error);
      return [];
    }
  },
  
  // Create a new deck
  createDeck: async (name: string, description?: string): Promise<Deck> => {
    try {
      const decks = await flashcardService.getAllDecks();
      
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        name,
        description,
        cardCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedDecks = [...decks, newDeck];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('flashcardDecks', JSON.stringify(updatedDecks));
      }
      
      return newDeck;
    } catch (error) {
      console.error('Failed to create deck:', error);
      throw new Error('Failed to create flashcard deck');
    }
  },
  
  // Add cards to a deck
  addCardsToDeck: async (deckId: string, cards: Omit<Flashcard, 'id' | 'deck'>[]): Promise<Flashcard[]> => {
    try {
      // Get all decks to validate deck exists
      const decks = await flashcardService.getAllDecks();
      const deck = decks.find(d => d.id === deckId);
      
      if (!deck) {
        throw new Error(`Deck with ID ${deckId} not found`);
      }
      
      // Get existing cards if any
      const cardsJson = localStorage.getItem(`flashcards-${deckId}`);
      let existingCards: Flashcard[] = cardsJson ? JSON.parse(cardsJson) : [];      // Format the new cards to match app's expected format
      const newCards: Flashcard[] = cards.map(card => {
        const uniqueId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        return {
          id: uniqueId,
          front: card.front,
          back: card.back,
          tags: card.tags || [],
          createdAt: new Date(),
          lastReviewed: undefined,
          deck: deckId,
          // Add additional fields that might be required by the app
          proficiency: 0,
          nextReview: new Date(),
          history: []
        };
      });
        const updatedCards = [...existingCards, ...newCards];
      
      // Update the deck's card count
      const updatedDeck = {
        ...deck,
        cardCount: updatedCards.length,
        updatedAt: new Date()
      };
      
      const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
      
      // Save updates in our service format
      if (typeof window !== 'undefined') {
        localStorage.setItem(`flashcards-${deckId}`, JSON.stringify(updatedCards));
        localStorage.setItem('flashcardDecks', JSON.stringify(updatedDecks));
        
        // Also synchronize with the app's native flashcard storage
        syncWithAppStorage(deckId, deck.name, newCards);
      }
      
      // Helper function to synchronize with the app's native flashcard storage
      const syncWithAppStorage = (deckId: string, deckName: string, cards: any[]) => {
        try {
          if (typeof window === 'undefined') return;
          
          // Get existing flashcards from app storage
          const existingDecksStr = localStorage.getItem('flashcards');
          
          if (existingDecksStr) {
            // App already has flashcards, update them
            const allDecks = JSON.parse(existingDecksStr);
            const deckIndex = allDecks.findIndex((d: any) => d.id === deckId);
            
            if (deckIndex >= 0) {
              // Deck exists, update its cards
              if (!allDecks[deckIndex].cards) {
                allDecks[deckIndex].cards = [];
              }
              
              // Add new cards to existing deck
              const existingCardIds = new Set(allDecks[deckIndex].cards.map((c: any) => c.id));
              const uniqueNewCards = cards.filter(card => !existingCardIds.has(card.id));
              
              allDecks[deckIndex].cards = [...allDecks[deckIndex].cards, ...uniqueNewCards];
              allDecks[deckIndex].lastModified = new Date().toISOString();
              
              localStorage.setItem('flashcards', JSON.stringify(allDecks));
              console.log('Updated existing deck in app storage');
            } else {
              // Deck doesn't exist, add it
              allDecks.push({
                id: deckId,
                name: deckName,
                description: 'Created from vocabulary extractor',
                cards: cards,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
              });
              localStorage.setItem('flashcards', JSON.stringify(allDecks));
              console.log('Added new deck to app storage');
            }
          } else {
            // No flashcards exist yet in app storage, create initial structure
            const newDeckStructure = [{
              id: deckId,
              name: deckName,
              description: 'Created from vocabulary extractor',
              cards: cards,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString()
            }];
            localStorage.setItem('flashcards', JSON.stringify(newDeckStructure));
            console.log('Created initial flashcards structure in app storage');
          }
          return true;
        } catch (e) {
          console.error('Error syncing with app storage:', e);
          return false;
        }
      };
      
      // Sync with app storage
      syncWithAppStorage(deckId, deck.name, newCards);
      
      return newCards;
    } catch (error) {
      console.error('Failed to add cards to deck:', error);
      throw new Error('Failed to add flashcards to deck');
    }
  },
  
  // Initialize with some sample data if empty
  initializeIfEmpty: async () => {
    const decks = await flashcardService.getAllDecks();
    
    if (decks.length === 0) {
      // Create some sample decks
      const basicDeck = await flashcardService.createDeck(
        'German Basics',
        'Essential German vocabulary for beginners'
      );
      
      const travelDeck = await flashcardService.createDeck(
        'Travel Vocabulary',
        'Useful phrases for traveling in German-speaking countries'
      );
      
      // Add some sample cards
      await flashcardService.addCardsToDeck(basicDeck.id, [
        { front: 'Hallo', back: 'Hello' },
        { front: 'Auf Wiedersehen', back: 'Goodbye' },
        { front: 'Danke', back: 'Thank you' }
      ]);
      
      await flashcardService.addCardsToDeck(travelDeck.id, [
        { front: 'Wo ist der Bahnhof?', back: 'Where is the train station?' },
        { front: 'Wie viel kostet das?', back: 'How much does this cost?' }
      ]);
    }
  }
};

export default flashcardService;