'use client';

import React, { useState } from 'react';
import { Flashcard } from '@/types/flashcards';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

interface FlashcardProps {
  card: Flashcard;
  mode?: 'standard' | 'learning';
  theme?: 'default' | 'minimal' | 'colorful' | 'gradient';
  onCardAction?: (action: 'prev' | 'next' | 'flip' | 'confidence', value?: number) => void;
  showControls?: boolean;
  showConfidence?: boolean;
  autoFlip?: boolean;
  autoFlipDelay?: number; // in ms
}

interface FlashcardComponentProps {
  flashcard: Flashcard;
  isFrontVisible?: boolean;
  onFlip?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  isPreview?: boolean;
  isReadOnly?: boolean;
  animateFlip?: boolean;
}

export function FlashcardComponent({
  flashcard,
  isFrontVisible = true,
  onFlip,
  onEdit,
  onDelete,
  className,
  isPreview = false,
  isReadOnly = false,
  animateFlip = true
}: FlashcardComponentProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  
  const handleFlip = () => {
    if (!onFlip) return;
    
    if (animateFlip) {
      setIsFlipping(true);
      // Allow time for animation before actually flipping
      setTimeout(() => {
        onFlip();
        setIsFlipping(false);
      }, 150);
    } else {
      onFlip();
    }
  };
  
  return (
    <Card 
      className={cn(
        "relative flex flex-col w-full h-full min-h-[220px] transition-all duration-300",
        isFlipping ? "transform scale-95 opacity-60" : "",
        isPreview ? "shadow-sm" : "shadow cursor-pointer hover:shadow-md",
        className
      )}
      onClick={isPreview || isReadOnly ? undefined : handleFlip}
      style={{ 
        perspective: "1000px",
      }}
    >
      <div 
        className={cn(
          "absolute inset-0 p-6 flex flex-col",
          "bg-card text-card-foreground dark:bg-card dark:text-card-foreground",
          "rounded-md border-2 border-transparent",
          isPreview && "border-dashed border-gray-300 dark:border-gray-600"
        )}
      >
        <div className="flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              {isFrontVisible ? "Question" : "Answer"}
            </div>

            {!isPreview && !isReadOnly && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-grow flex items-center justify-center text-center">
            <div className={cn(
              "max-w-full overflow-auto",
              isFrontVisible ? "text-xl font-medium" : "text-lg"
            )}>
              {isFrontVisible ? flashcard.question : flashcard.answer}
            </div>
          </div>
          
          {!isPreview && !isReadOnly && (
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Tap to {isFrontVisible ? "see answer" : "see question"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function FlashcardComponent({
  card,
  mode = 'standard',
  theme = 'default',
  onCardAction,
  showControls = true,
  showConfidence = false,
  autoFlip = false,
  autoFlipDelay = 5000,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Handle card flip
  const handleFlip = () => {
    if (isFlipping) return; // Prevent multiple flips while animating
    
    setIsFlipping(true);
    setIsFlipped(!isFlipped);
    
    if (onCardAction) {
      onCardAction('flip');
    }
    
    // Reset the flipping state after animation completes
    setTimeout(() => setIsFlipping(false), 600);
  };

  // Auto flip after delay if enabled
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoFlip && !isFlipped) {
      timer = setTimeout(() => {
        handleFlip();
      }, autoFlipDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoFlip, isFlipped, autoFlipDelay]);

  // Set confidence level
  const handleConfidenceSelect = (level: number) => {
    if (onCardAction) {
      onCardAction('confidence', level);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div 
        className={cn(
          "w-full h-96 relative cursor-pointer perspective-1000",
          isFlipping && "pointer-events-none"
        )}
        onClick={handleFlip}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 0 : -180, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full absolute backface-hidden"
          >            <div className={cn(
              "w-full h-full rounded-xl shadow-lg overflow-hidden flex flex-col",
              theme === 'default' && "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
              theme === 'minimal' && "bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800",
              theme === 'colorful' && isFlipped 
                ? "bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-950 dark:to-cyan-950 border border-green-200 dark:border-green-800" 
                : "bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 border border-blue-200 dark:border-blue-800",
              theme === 'gradient' && isFlipped
                ? "bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-900 border-0"
                : "bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-900 border-0"
            )}>
              {/* Header with indicator */}              <div className={cn(
                "p-3 flex items-center justify-between",
                theme === 'default' && "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900",
                theme === 'minimal' && "border-b border-gray-200 dark:border-gray-700",
                theme === 'colorful' && isFlipped 
                  ? "border-b border-green-200 dark:border-green-800 bg-gradient-to-r from-green-100 to-cyan-100 dark:from-green-900 dark:to-cyan-900" 
                  : "border-b border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900 dark:to-violet-900",
                theme === 'gradient' && isFlipped
                  ? "border-b border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-100/50 dark:bg-emerald-900/30 backdrop-blur-sm"
                  : "border-b border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-100/50 dark:bg-indigo-900/30 backdrop-blur-sm"
              )}>
                <span className={cn(
                  "text-sm font-medium",
                  (theme === 'default' || theme === 'minimal') && "text-gray-500 dark:text-gray-400",
                  theme === 'colorful' && isFlipped ? "text-green-800 dark:text-green-300" : "text-blue-800 dark:text-blue-300"
                )}>
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
                <div className="flex items-center gap-2">
                  {mode === 'learning' && (
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isFlipped ? "bg-green-500" : "bg-blue-500"
                      )}></div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {isFlipped ? 'A' : 'Q'}
                      </span>
                    </div>
                  )}                  {/* Card indicator */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs flex items-center">
                      {card.generatedBy === 'ai' && '✨ AI'}
                      {card.model && ` · ${card.model.split('-').pop()}`}
                      <span className="inline-block mx-1">·</span>
                      <span className="inline-block w-4 h-4">🇩🇪</span>
                    </span>
                  </div>
                </div>
              </div>
                {/* Content */}
              <div className={cn(
                "flex-1 p-6 flex flex-col justify-center overflow-auto",
                theme === 'colorful' && "backdrop-blur-[2px]"
              )}>
                {/* Learning mode shows both Q&A */}
                {mode === 'learning' ? (
                  <>
                    <div className="mb-6">
                      <h3 className={cn(
                        "text-sm font-semibold mb-2",
                        (theme === 'default' || theme === 'minimal') && "text-gray-500 dark:text-gray-400",
                        theme === 'colorful' && "text-blue-700 dark:text-blue-300"
                      )}>Question:</h3>
                      <p className={cn(
                        "text-lg",
                        (theme === 'default' || theme === 'minimal') && "text-gray-900 dark:text-gray-100",
                        theme === 'colorful' && "text-gray-800 dark:text-gray-200 font-medium"
                      )}>{card.question}</p>
                    </div>
                    <div className={isFlipped ? 'opacity-100' : 'opacity-0'}>
                      <h3 className={cn(
                        "text-sm font-semibold mb-2",
                        (theme === 'default' || theme === 'minimal') && "text-gray-500 dark:text-gray-400",
                        theme === 'colorful' && "text-green-700 dark:text-green-300"
                      )}>Answer:</h3>
                      <p className={cn(
                        "text-lg",
                        (theme === 'default' || theme === 'minimal') && "text-gray-900 dark:text-gray-100",
                        theme === 'colorful' && isFlipped && "text-gray-800 dark:text-gray-200 font-medium"
                      )}>{card.answer}</p>
                    </div>
                  </>
                ) : (
                  // Standard mode shows either Q or A
                  <div className="relative">
                    {theme === 'colorful' && !isFlipped && (
                      <div className="absolute -top-16 -right-8 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl"></div>
                    )}
                    {theme === 'colorful' && isFlipped && (
                      <div className="absolute -top-16 -right-8 w-32 h-32 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-xl"></div>
                    )}
                    <p className={cn(
                      "text-xl relative text-center",
                      (theme === 'default' || theme === 'minimal') && "text-gray-900 dark:text-gray-100",
                      theme === 'colorful' && !isFlipped && "text-blue-950 dark:text-blue-50 font-medium",
                      theme === 'colorful' && isFlipped && "text-green-950 dark:text-green-50 font-medium"
                    )}>
                      {isFlipped ? card.answer : card.question}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Tap indicator */}
              <div className="absolute bottom-4 right-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M7 11v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1z"></path>
                  <path d="M13 7V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4"></path>
                  <path d="M5 7H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1"></path>
                  <path d="M17 7h1a1 0 0 1 1 1v8a1 0 0 1-1 1h-1"></path>
                </svg>
                Tap to {isFlipped ? 'flip back' : 'reveal'}
              </div>
              
              {/* Tags */}
              {card.tags && card.tags.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                  {card.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-6 flex justify-between items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCardAction?.('prev')}
          >
            Previous
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFlip}
          >
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCardAction?.('next')}
          >
            Next
          </Button>
        </div>
      )}      {/* Confidence selector */}
      {showConfidence && isFlipped && (
        <div className={cn(
          "mt-6 p-4 rounded-lg",
          theme === 'default' && "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          theme === 'minimal' && "bg-gray-50 dark:bg-gray-900",
          theme === 'colorful' && "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-100 dark:border-green-800"
        )}>
          <p className={cn(
            "text-sm font-medium text-center mb-3",
            (theme === 'default' || theme === 'minimal') && "text-gray-700 dark:text-gray-300",
            theme === 'colorful' && "text-green-800 dark:text-green-200"
          )}>
            How well did you know this?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
              // Different button styles based on level and theme
              const getButtonStyle = () => {
                if (theme === 'colorful') {
                  if (level <= 2) return "bg-red-500 hover:bg-red-600 text-white";
                  if (level === 3) return "bg-yellow-500 hover:bg-yellow-600 text-white";
                  if (level === 4) return "bg-green-500 hover:bg-green-600 text-white";
                  return "bg-emerald-500 hover:bg-emerald-600 text-white";
                }
                
                return level <= 2 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : level === 3 
                    ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100" 
                    : "bg-green-600 hover:bg-green-700 text-white";
              };
              
              return (
                <Button
                  key={level}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConfidenceSelect(level)}
                  className={cn(
                    "w-10 h-10 rounded-full font-medium",
                    getButtonStyle()
                  )}
                >
                  {level}
                </Button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs mt-2 px-1">
            <span className={cn(
              (theme === 'default' || theme === 'minimal') && "text-gray-500 dark:text-gray-400",
              theme === 'colorful' && "text-red-600 dark:text-red-400"
            )}>
              Not at all
            </span>
            <span className={cn(
              (theme === 'default' || theme === 'minimal') && "text-gray-500 dark:text-gray-400",
              theme === 'colorful' && "text-green-600 dark:text-green-400"
            )}>
              Perfect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}