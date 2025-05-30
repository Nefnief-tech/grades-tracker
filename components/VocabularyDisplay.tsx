import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VocabularyItem {
  term?: string;
  definition?: string;
  word?: string;
  translation?: string;
  source?: string;
  target?: string;
  [key: string]: any; // For other potential properties
}

interface VocabularyDisplayProps {
  vocabulary: VocabularyItem[];
  className?: string;
}

export function VocabularyDisplay({ vocabulary, className = "" }: VocabularyDisplayProps) {
  // Handle empty vocabulary
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">No vocabulary items to display</p>
      </Card>
    );
  }

  // Normalize vocabulary data to handle different key names
  const normalizedVocabulary = vocabulary.map(item => {
    // Create a normalized item with consistent properties
    return {
      term: item.term || item.word || item.source || Object.values(item)[0] || "",
      definition: item.definition || item.translation || item.target || Object.values(item)[1] || ""
    };
  });

  return (
    <div className={`vocabulary-display ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Term</TableHead>
            <TableHead>Definition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {normalizedVocabulary.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.term}</TableCell>
              <TableCell>{item.definition}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Alternative card-based display
export function VocabularyCardDisplay({ vocabulary, className = "" }: VocabularyDisplayProps) {
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">No vocabulary items to display</p>
      </Card>
    );
  }

  // Normalize vocabulary data to handle different key names
  const normalizedVocabulary = vocabulary.map(item => {
    return {
      term: item.term || item.word || item.source || Object.values(item)[0] || "",
      definition: item.definition || item.translation || item.target || Object.values(item)[1] || ""
    };
  });

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {normalizedVocabulary.map((item, index) => (
        <Card key={index} className="p-4">
          <h3 className="font-medium mb-2">{item.term}</h3>
          <p className="text-muted-foreground">{item.definition}</p>
        </Card>
      ))}
    </div>
  );
}