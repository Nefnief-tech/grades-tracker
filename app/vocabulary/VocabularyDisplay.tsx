import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Save, Bug } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { flashcardDebugUtils } from "@/app/utils/flashcardDebugUtils";

interface VocabularyItem {
  term?: string;
  definition?: string;
  word?: string;
  translation?: string;
  [key: string]: any; // For other possible field names
}

interface VocabularyDisplayProps {
  vocabulary: VocabularyItem[];
  title?: string;
}

export const VocabularyDisplay: React.FC<VocabularyDisplayProps> = ({ 
  vocabulary, 
  title = "Extracted Vocabulary" 
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [createNewDeck, setCreateNewDeck] = useState(false);
  const [decks, setDecks] = useState<Array<{id: string, name: string}>>([]);
    // Load available decks
  useEffect(() => {
    const loadDecks = () => {      try {
        // Get all decks directly from localStorage
        const flashcardsStr = localStorage.getItem('flashcards');
        let availableDecks = flashcardsStr ? JSON.parse(flashcardsStr) : [];
        
        if (!Array.isArray(availableDecks)) {
          console.warn('Flashcards data is not an array, resetting');
          availableDecks = [];
        }
        
        console.log(`Loaded ${availableDecks.length} flashcard decks`);
        setDecks(availableDecks);
        
        // Use debug utility to check what we're working with
        flashcardDebugUtils.inspectLocalStorage();
      } catch (error) {
        console.error("Failed to load flashcard decks:", error);
        toast({
          title: "Error loading decks",
          description: "Could not load your flashcard decks",
          variant: "destructive"
        });
      }
    };
    
    loadDecks();
  }, []);
  
  const copyToClipboard = () => {
    try {
      // Format vocabulary items for clipboard
      const text = vocabulary.map(item => {
        const term = item.term || item.word || '';
        const definition = item.definition || item.translation || '';
        return `${term}\t${definition}`;
      }).join('\n');
      
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${vocabulary.length} vocabulary items copied`,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy vocabulary to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  const selectAll = () => {
    if (selectedItems.length === vocabulary.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(vocabulary.map((_, index) => index));
    }
  };
  
  const handleCreateFlashcards = () => {
    setShowSaveDialog(true);
  };
  
  // Get field names to display vocabulary consistently
  const getFieldNames = () => {
    if (!vocabulary || vocabulary.length === 0) {
      return { termField: 'term', definitionField: 'definition' };
    }
    
    const firstItem = vocabulary[0];
    
    if (firstItem.term && firstItem.definition) {
      return { termField: 'term', definitionField: 'definition' };
    }
    
    if (firstItem.word && firstItem.translation) {
      return { termField: 'word', definitionField: 'translation' };
    }
    
    // Find first two keys if standard fields not found
    const keys = Object.keys(firstItem);
    return { 
      termField: keys[0] || 'term', 
      definitionField: keys[1] || 'definition'
    };
  };

  const { termField, definitionField } = getFieldNames();
  const saveToVocabulary = async () => {
    try {
      // Get selected vocabulary items
      const selectedVocabulary = selectedItems.map(index => vocabulary[index]);
      
      if (selectedVocabulary.length === 0) {
        toast({
          title: "No items selected",
          description: "Please select at least one vocabulary item",
          variant: "destructive"
        });
        return;
      }
      
      // Validate input
      if (createNewDeck && !newDeckName.trim()) {
        toast({
          title: "Deck name required",
          description: "Please enter a name for the new deck",
          variant: "destructive"
        });
        return;
      } else if (!createNewDeck && !selectedDeckId) {
        toast({
          title: "Deck selection required",
          description: "Please select a deck or create a new one",
          variant: "destructive"
        });
        return;
      }
      
      // Import vocabulary service dynamically
      const { VocabularyService } = await import('@/app/services/VocabularyService');
      
      let targetDeckId = '';
      
      if (createNewDeck) {
        // Create a new vocabulary deck
        const newDeck = VocabularyService.createDeck(
          newDeckName, 
          "Created from vocabulary extractor"
        );
        targetDeckId = newDeck.id;
        
        // Import terms to the new deck
        VocabularyService.importFromExtractor(targetDeckId, selectedVocabulary);
        
        console.log(`Created new vocabulary deck: ${newDeckName} (${targetDeckId})`);
      } else {
        // Add terms to existing deck
        targetDeckId = selectedDeckId;
        const importedTerms = VocabularyService.importFromExtractor(targetDeckId, selectedVocabulary);
        
        console.log(`Added ${importedTerms.length} terms to existing deck (${targetDeckId})`);
      }
      
      // Show success message
      toast({
        title: "Vocabulary saved!",
        description: `Added ${selectedVocabulary.length} terms to your vocabulary deck`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/vocabulary/study/${targetDeckId}`)}
          >
            Study Now
          </Button>
        ),
        duration: 8000
      });
      
      // Close the dialog and reset
      setShowSaveDialog(false);
      setSelectedItems([]);
      setNewDeckName("");
      setSelectedDeckId("");
      setCreateNewDeck(false);
      
      // Refresh decks list
      const updatedDecks = VocabularyService.getAllDecks();
      setDecks(updatedDecks);
      
    } catch (error) {
      console.error("Failed to save vocabulary:", error);
      toast({
        title: "Failed to save",
        description: "Could not create vocabulary deck. Please try again.",
        variant: "destructive"
      });
    }
  };
    // Add a function to help navigate to the flashcard deck
  const router = useRouter();
  
  const goToFlashcardDeck = (deckId: string) => {
    console.log(`Navigating to flashcard deck: ${deckId}`);
    
    // Check if the deck exists before navigating
    const flashcardsStr = localStorage.getItem('flashcards');
    if (flashcardsStr) {
      const decks = JSON.parse(flashcardsStr);
      const deckExists = decks.some((d: any) => d.id === deckId);
      
      if (deckExists) {
        console.log(`Deck ${deckId} exists - redirecting`);
        router.push(`/flashcards/deck/${deckId}`);
      } else {
        console.error(`Deck ${deckId} not found in storage`);
        toast({
          title: "Deck not found",
          description: "The deck could not be found. Please check the flashcards section.",
          variant: "destructive"
        });
      }
    }
  };
    // Create a properly formatted deck that works with flashcard routes
  const createCompatibleDeck = (id: string, name: string, cards: any[]) => {
    const nowIso = new Date().toISOString();
    
    // Make sure cards have all required fields
    const formattedCards = cards.map(card => {
      // Ensure all required properties exist
      return {
        ...card,
        id: card.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        front: card.front || card.term || '',
        back: card.back || card.definition || '',
        proficiency: card.proficiency !== undefined ? card.proficiency : 0,
        nextReview: card.nextReview || nowIso,
        history: card.history || [],
        createdAt: card.createdAt || nowIso,
        tags: card.tags || ['vocabulary-extractor']
      };
    });
    
    return {
      id,
      name,
      description: 'Created from vocabulary extractor',
      cards: formattedCards,
      createdAt: nowIso,
      lastModified: nowIso,
      version: 1,
      type: "standard",
      settings: {
        reviewsPerSession: 10,
        showDefinitionFirst: false
      }
    };
  };
  
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No vocabulary items to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4">        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {title}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleCreateFlashcards}
                disabled={selectedItems.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Create Flashcards</span>
              </Button>              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {                  // First, repair any existing flashcard data
                  const wasRepaired = flashcardDebugUtils.repairFlashcardData();
                  if (wasRepaired) {
                    toast({
                      title: "Flashcards repaired",
                      description: "Fixed issues with existing flashcard data"
                    });
                  }
                  
                  // Create a sample deck to verify functionality
                  const sampleDeck = flashcardDebugUtils.createSampleDeck();
                  if (sampleDeck) {
                    const deckId = sampleDeck.id;
                    toast({
                      title: "Sample deck created",
                      description: "A sample deck has been created for testing",
                      action: (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => goToFlashcardDeck(deckId)}
                        >
                          View Deck
                        </Button>
                      )
                    });
                    
                    // Log the deck to console for inspection
                    console.log("Created sample deck:", sampleDeck);
                    console.log(`To view deck, go to: /flashcards/deck/${deckId}`);
                    
                    // Refresh the decks list
                    const flashcardsStr = localStorage.getItem('flashcards');
                    const updatedDecks = flashcardsStr ? JSON.parse(flashcardsStr) : [];
                    setDecks(updatedDecks);
                      // Log all decks
                    flashcardDebugUtils.inspectLocalStorage();
                  }
                }}
              >
                <Bug className="h-4 w-4" />
                <span>Test Decks</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={vocabulary.length > 0 && selectedItems.length === vocabulary.length}
                    onCheckedChange={selectAll}
                  />
                </TableHead>
                <TableHead className="w-[45%]">Term</TableHead>
                <TableHead className="w-[45%]">Definition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.map((item, index) => {
                const term = item[termField] || item.term || item.word || '';
                const definition = item[definitionField] || item.definition || item.translation || '';
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(index)}
                        onCheckedChange={() => toggleItemSelection(index)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{term}</TableCell>
                    <TableCell>{definition}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} of {vocabulary.length} items selected
          </div>          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/flashcards')}
          >
            View All Flashcard Decks
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Flashcards</DialogTitle>
            <DialogDescription>
              Add selected vocabulary ({selectedItems.length} items) to a flashcard deck
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="create-new-deck" 
                checked={createNewDeck}
                onCheckedChange={(checked) => setCreateNewDeck(checked === true)}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="create-new-deck">
                  Create a new deck
                </Label>
              </div>
            </div>
            
            {createNewDeck ? (
              <div className="grid gap-2">
                <Label htmlFor="new-deck-name">New Deck Name</Label>
                <Input 
                  id="new-deck-name" 
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Enter deck name"
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="existing-deck">Select Existing Deck</Label>
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map(deck => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveToVocabulary}>
              <Save className="h-4 w-4 mr-2" />
              Save to Flashcards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VocabularyDisplay;