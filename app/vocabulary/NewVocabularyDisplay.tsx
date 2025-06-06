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
import { Copy, Plus, BookOpen } from "lucide-react";
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
import { VocabularyService } from "@/app/services/VocabularyService";
import { VocabularyDeck } from "@/app/models/VocabularyFlashcard";

interface VocabularyDisplayProps {
  vocabulary: Array<{term?: string; definition?: string; word?: string; translation?: string; [key: string]: any}>;
  title: string;
}

export const NewVocabularyDisplay: React.FC<VocabularyDisplayProps> = ({
  vocabulary,
  title
}) => {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [createNewDeck, setCreateNewDeck] = useState(true);
  const [newDeckName, setNewDeckName] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  
  // Load available decks
  useEffect(() => {
    const loadDecks = () => {
      try {
        const availableDecks = VocabularyService.getAllDecks();
        console.log(`Loaded ${availableDecks.length} vocabulary decks`);
        setDecks(availableDecks);
      } catch (error) {
        console.error("Failed to load vocabulary decks:", error);
        toast({
          title: "Error loading decks",
          description: "Could not load your vocabulary decks",
          variant: "destructive"
        });
      }
    };
    
    loadDecks();
  }, []);
  
  const toggleItem = (index: number) => {
    setSelectedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(item => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  const toggleAll = () => {
    if (selectedItems.length === vocabulary.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...Array(vocabulary.length).keys()]);
    }
  };
  
  const copyToClipboard = () => {
    const text = vocabulary.map(item => {
      const term = item.term || item.word || '';
      const definition = item.definition || item.translation || '';
      return `${term} - ${definition}`;
    }).join('\n');
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description: "Vocabulary list copied to clipboard"
    });
  };
  
  const handleCreateVocabulary = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one vocabulary item",
        variant: "destructive"
      });
      return;
    }
    
    setShowSaveDialog(true);
  };
  
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
      
      let targetDeckId = '';
      
      if (createNewDeck) {
        // Create a new vocabulary deck
        const newDeck = VocabularyService.createDeck(
          newDeckName, 
          "Created from vocabulary extractor"
        );
        targetDeckId = newDeck.id;
        
        // Import terms to the new deck
        const importedTerms = VocabularyService.importFromExtractor(targetDeckId, selectedVocabulary);
        
        console.log(`Created new vocabulary deck: ${newDeckName} (${targetDeckId}) with ${importedTerms.length} terms`);
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
  
  return (
    <>
      <Card>
        <CardHeader>
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
                onClick={handleCreateVocabulary}
                disabled={selectedItems.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Create Vocabulary</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedItems.length === vocabulary.length && vocabulary.length > 0}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Definition/Translation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabulary.map((item, index) => {
                const term = item.term || item.word || '';
                const definition = item.definition || item.translation || '';
                
                return (
                  <TableRow key={index}>
                    <TableCell className="py-2">
                      <Checkbox 
                        checked={selectedItems.includes(index)}
                        onCheckedChange={() => toggleItem(index)}
                        aria-label={`Select ${term}`}
                      />
                    </TableCell>
                    <TableCell className="py-2 font-medium">{term}</TableCell>
                    <TableCell className="py-2">{definition}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} of {vocabulary.length} items selected
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/vocabulary/study')}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View All Vocabulary Decks
          </Button>
        </CardFooter>
      </Card>
      
      {/* Save to Vocabulary Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Vocabulary</DialogTitle>
            <DialogDescription>
              Save selected vocabulary items to a deck for studying.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="create-new"
                checked={createNewDeck}
                onCheckedChange={(checked) => setCreateNewDeck(checked === true)}
              />
              <Label htmlFor="create-new">Create new deck</Label>
            </div>
            
            {createNewDeck ? (
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input 
                  id="deck-name" 
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Enter deck name"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="deck-select">Select Deck</Label>
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger id="deck-select">
                    <SelectValue placeholder="Select a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name} ({deck.terms?.length || 0} terms)
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
              Save to Vocabulary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewVocabularyDisplay;