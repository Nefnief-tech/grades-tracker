import { v4 as uuidv4 } from 'uuid';
import { Flashcard, FlashcardDeck, FlashcardQuery } from '@/types/flashcards';

/**
 * Service for managing flashcards with localStorage
 */
export class FlashcardService {
  private static DECKS_STORAGE_KEY = 'flashcard_decks';
  private static CARDS_STORAGE_KEY = 'flashcard_cards';

  // Get all flashcard decks
  static getDecks(): FlashcardDeck[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const decksJson = localStorage.getItem(this.DECKS_STORAGE_KEY);
      return decksJson ? JSON.parse(decksJson) : [];
    } catch (error) {
      console.error('Error getting flashcard decks:', error);
      return [];
    }
  }

  // Save all flashcard decks
  static saveDecks(decks: FlashcardDeck[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.DECKS_STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
      console.error('Error saving flashcard decks:', error);
    }
  }

  // Create a new deck
  static createDeck(name: string, description?: string, color?: string): FlashcardDeck {
    const newDeck: FlashcardDeck = {
      id: uuidv4(),
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      cardCount: 0,
      color: color || '#3b82f6', // Default blue color
    };

    const decks = this.getDecks();
    decks.push(newDeck);
    this.saveDecks(decks);

    return newDeck;
  }

  // Update a deck
  static updateDeck(updatedDeck: FlashcardDeck): FlashcardDeck {
    const decks = this.getDecks();
    const index = decks.findIndex(deck => deck.id === updatedDeck.id);
    
    if (index !== -1) {
      decks[index] = { ...decks[index], ...updatedDeck };
      this.saveDecks(decks);
      return decks[index];
    }
    
    throw new Error(`Deck with ID ${updatedDeck.id} not found`);
  }

  // Delete a deck and all its cards
  static deleteDeck(deckId: string): void {
    const decks = this.getDecks().filter(deck => deck.id !== deckId);
    this.saveDecks(decks);
    
    // Also delete all cards in this deck
    const cards = this.getCards();
    const remainingCards = cards.filter(card => card.deckId !== deckId);
    this.saveCards(remainingCards);
  }

  // Get flashcard deck by ID
  static getDeck(deckId: string): FlashcardDeck | null {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === deckId);
    return deck || null;
  }

  // Get all flashcards
  static getCards(): Flashcard[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const cardsJson = localStorage.getItem(this.CARDS_STORAGE_KEY);
      return cardsJson ? JSON.parse(cardsJson) : [];
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return [];
    }
  }

  // Save all flashcards
  static saveCards(cards: Flashcard[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  }

  // Create a new flashcard
  static createFlashcard(deckId: string, question: string, answer: string, tags?: string[]): Flashcard {
    const newCard: Flashcard = {
      id: uuidv4(),
      question,
      answer,
      createdAt: new Date().toISOString(),
      timesReviewed: 0,
      confidenceLevel: 1,
      tags: tags || [],
      deckId
    };

    const cards = this.getCards();
    cards.push(newCard);
    this.saveCards(cards);

    // Update the card count in the deck
    this.updateDeckCardCount(deckId);

    return newCard;
  }

  // Create multiple flashcards at once
  static createFlashcards(deckId: string, flashcards: Array<{question: string, answer: string, tags?: string[]}>): Flashcard[] {
    const newCards = flashcards.map(fc => ({
      id: uuidv4(),
      question: fc.question,
      answer: fc.answer,
      createdAt: new Date().toISOString(),
      timesReviewed: 0,
      confidenceLevel: 1,
      tags: fc.tags || [],
      deckId
    }));

    const cards = this.getCards();
    cards.push(...newCards);
    this.saveCards(cards);

    // Update the card count in the deck
    this.updateDeckCardCount(deckId);

    return newCards;
  }

  // Update a flashcard
  static updateFlashcard(updatedCard: Flashcard): Flashcard {
    const cards = this.getCards();
    const index = cards.findIndex(card => card.id === updatedCard.id);
    
    if (index !== -1) {
      cards[index] = { ...cards[index], ...updatedCard };
      this.saveCards(cards);
      return cards[index];
    }
    
    throw new Error(`Flashcard with ID ${updatedCard.id} not found`);
  }

  // Delete a flashcard
  static deleteFlashcard(cardId: string): void {
    const cards = this.getCards();
    const cardIndex = cards.findIndex(card => card.id === cardId);
    
    if (cardIndex !== -1) {
      const deckId = cards[cardIndex].deckId;
      cards.splice(cardIndex, 1);
      this.saveCards(cards);
      
      // Update the card count in the deck
      this.updateDeckCardCount(deckId);
    }
  }

  // Get flashcards by deck ID
  static getCardsByDeck(deckId: string): Flashcard[] {
    return this.getCards().filter(card => card.deckId === deckId);
  }

  // Get flashcards with query options
  static queryCards(query: FlashcardQuery): Flashcard[] {
    let cards = this.getCards();
    
    // Filter by deck ID
    if (query.deckId) {
      cards = cards.filter(card => card.deckId === query.deckId);
    }
    
    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      cards = cards.filter(card => 
        card.tags && query.tags!.some(tag => card.tags!.includes(tag))
      );
    }
    
    // Filter by confidence level
    if (query.confidenceLevel !== undefined) {
      cards = cards.filter(card => card.confidenceLevel === query.confidenceLevel);
    }
    
    // Filter by review due
    if (query.reviewDue) {
      const now = new Date();
      cards = cards.filter(card => 
        card.nextReviewDate && new Date(card.nextReviewDate) <= now
      );
    }
    
    // Filter by search query
    if (query.searchQuery) {
      const search = query.searchQuery.toLowerCase();
      cards = cards.filter(card => 
        card.question.toLowerCase().includes(search) || 
        card.answer.toLowerCase().includes(search)
      );
    }
    
    // Randomize if requested
    if (query.randomize) {
      cards = this.shuffleArray(cards);
    }
    
    // Apply limit
    if (query.limit && query.limit > 0) {
      cards = cards.slice(0, query.limit);
    }
    
    return cards;
  }

  // Mark a card as reviewed
  static markCardAsReviewed(cardId: string, confidenceLevel: number): Flashcard {
    const cards = this.getCards();
    const index = cards.findIndex(card => card.id === cardId);
    
    if (index === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    const card = cards[index];
    const now = new Date();
    
    // Calculate next review date based on confidence level
    const nextReviewDate = this.calculateNextReviewDate(now, confidenceLevel);
    
    const updatedCard: Flashcard = {
      ...card,
      lastReviewed: now.toISOString(),
      timesReviewed: (card.timesReviewed || 0) + 1,
      confidenceLevel,
      nextReviewDate: nextReviewDate.toISOString()
    };
    
    cards[index] = updatedCard;
    this.saveCards(cards);
    
    return updatedCard;
  }

  // Update card count in a deck
  private static updateDeckCardCount(deckId: string): void {
    const decks = this.getDecks();
    const deckIndex = decks.findIndex(deck => deck.id === deckId);
    
    if (deckIndex !== -1) {
      const cardCount = this.getCardsByDeck(deckId).length;
      decks[deckIndex].cardCount = cardCount;
      decks[deckIndex].lastOpened = new Date().toISOString();
      this.saveDecks(decks);
    }
  }

  // Calculate next review date using spaced repetition algorithm
  private static calculateNextReviewDate(now: Date, confidenceLevel: number): Date {
    const nextDate = new Date(now);
    
    // Simple spaced repetition algorithm:
    // 1 = review today
    // 2 = review in 1 day
    // 3 = review in 3 days
    // 4 = review in 7 days
    // 5 = review in 14 days
    const daysToAdd = {
      1: 0,
      2: 1,
      3: 3,
      4: 7,
      5: 14
    }[confidenceLevel] || 1;
    
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  // Fisher-Yates shuffle algorithm
  private static shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}