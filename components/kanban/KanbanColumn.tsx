"use client";

import React, { useState, useRef, DragEvent } from "react";
import {
  KanbanColumn as ColumnType,
  KanbanCard as CardType,
} from "@/types/kanban";
import { KanbanCardComponent } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Plus,
  X,
  Check,
  Trash,
  Edit,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Brush,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface KanbanColumnProps {
  column: ColumnType;
  cards: CardType[];
  onCardCreate: (data: {
    title: string;
    description?: string;
  }) => Promise<CardType>;
  onCardUpdate: (id: string, data: Partial<CardType>) => Promise<CardType>;
  onCardDelete: (id: string) => Promise<boolean>;
  onColumnUpdate: (data: Partial<ColumnType>) => Promise<ColumnType>;
  onColumnDelete: () => Promise<boolean>;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  columnsMap: Record<string, string>; // Map of column IDs to titles for moving cards
  onMoveCard: (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string
  ) => void;
  highlightOverdue?: boolean;
}

export function KanbanColumn({
  column,
  cards,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onColumnUpdate,
  onColumnDelete,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  columnsMap,
  onMoveCard,
  highlightOverdue = true,
}: KanbanColumnProps) {
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [columnColor, setColumnColor] = useState(column.color || "#e0e0e0");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Enhanced brighter color palette with better visibility
  const columnColors = [
    // Bright colors
    "#FF5252", // bright red
    "#FF9800", // bright orange
    "#FFEB3B", // bright yellow
    "#4CAF50", // bright green
    "#2196F3", // bright blue
    "#9C27B0", // bright purple
    "#F06292", // bright pink

    // Softer colors but still vibrant
    "#81C784", // softer green
    "#64B5F6", // softer blue
    "#FFB74D", // softer orange
    "#BA68C8", // softer purple
    "#4DD0E1", // teal
    "#FFF176", // softer yellow
    "#E57373", // softer red

    // Pastel options
    "#B2EBF2", // pastel blue
    "#C8E6C9", // pastel green
    "#F8BBD0", // pastel pink
    "#FFE0B2", // pastel orange
    "#D1C4E9", // pastel purple

    // Neutral options
    "#E0E0E0", // light gray
    "#BDBDBD", // medium gray
    "#9E9E9E", // dark gray
  ];

  // Update column color with enhanced visual feedback
  const handleColorChange = async (color: string) => {
    setColumnColor(color);
    setShowColorPicker(false);
    await onColumnUpdate({ color });

    // Provide feedback on color change
    toast({
      description: "Column color updated",
    });
  };

  // Improved drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only set to false if we're leaving the column (not entering a child element)
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  // Improved drop handler to prevent duplication
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Only process the drop once
    e.stopPropagation();

    const cardId = e.dataTransfer.getData("text/plain");
    const sourceColumnId = e.dataTransfer.getData("source-column");

    setIsDragOver(false);
    setDraggedOverIndex(null);

    if (!cardId) {
      console.log("No card ID in drop data");
      return;
    }

    // Log for debugging
    console.log(
      `Drop received for card ${cardId} from ${
        sourceColumnId || "unknown"
      } to ${column.id}`
    );

    // Skip if trying to drop in the same column
    if (sourceColumnId === column.id) {
      console.log("Card dropped in same column, skipping move");
      return;
    }

    // Check if card already exists in this column to prevent duplicates
    if (cards.some((card) => card.id === cardId)) {
      console.log("Card already exists in this column, skipping move");
      return;
    }

    // Move the card with the source column ID
    if (sourceColumnId) {
      onMoveCard(cardId, sourceColumnId, column.id);
      return;
    }

    console.log("Could not determine source column for move");
  };

  // Group cards by priority for better visual organization
  const getCardsGroupedByPriority = () => {
    const highPriority = cards.filter((card) => card.priority === "high");
    const mediumPriority = cards.filter((card) => card.priority === "medium");
    const lowPriority = cards.filter((card) => card.priority === "low");
    const noPriority = cards.filter((card) => !card.priority);

    return [...highPriority, ...mediumPriority, ...lowPriority, ...noPriority];
  };

  // Handle column title edit
  const handleTitleSave = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Column title required",
        description: "Please enter a title for the column",
        variant: "destructive",
      });
      return;
    }

    try {
      await onColumnUpdate({ title: editedTitle.trim() });
      setIsEditingTitle(false);
      toast({
        description: "Column title updated",
      });
    } catch (error) {
      console.error("Failed to update column title:", error);
      toast({
        title: "Update failed",
        description: "Failed to update column title",
        variant: "destructive",
      });
    }
  };

  // Handle column deletion
  const handleDeleteColumn = async () => {
    try {
      await onColumnDelete();
      setDeleteDialogOpen(false);
      toast({
        description: "Column deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete column:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete column",
        variant: "destructive",
      });
    }
  };

  // Handle card creation
  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) {
      toast({
        title: "Card title required",
        description: "Please enter a title for the card",
        variant: "destructive",
      });
      return;
    }

    try {
      await onCardCreate({
        title: newCardTitle.trim(),
        description: newCardDescription.trim() || undefined,
      });

      setNewCardTitle("");
      setNewCardDescription("");
      setNewCardDialogOpen(false);
      toast({
        description: "Card created successfully",
      });
    } catch (error) {
      console.error("Failed to create card:", error);
      toast({
        title: "Create failed",
        description: "Failed to create card",
        variant: "destructive",
      });
    }
  };

  // Enhanced column drag start with data transfer
  const handleColumnDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("column-id", column.id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleColumnDragEnd = () => {
    setIsDragging(false);
  };

  const handleCardDragOver = (index: number) => {
    setDraggedOverIndex(index);
  };

  return (
    <div
      className={`flex flex-col bg-background border rounded-lg w-80 shrink-0 max-h-full ${
        isDragging ? "opacity-50 z-10" : ""
      } ${
        isDragOver ? "border-primary border-dashed border-2 bg-primary/5" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable="true"
      onDragStart={handleColumnDragStart}
      onDragEnd={handleColumnDragEnd}
    >
      {/* Column Header with enhanced color opacity for better visibility */}
      <div
        className="p-3 font-medium border-b flex items-center justify-between rounded-t-lg"
        style={{
          backgroundColor: columnColor ? `${columnColor}40` : "var(--muted)", // Increased opacity for better visibility
          borderColor: columnColor ? `${columnColor}` : "var(--border)", // Solid border color
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          {/* Column Title (Editable) */}
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-1">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-7 py-1 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                  if (e.key === "Escape") {
                    setIsEditingTitle(false);
                    setEditedTitle(column.title);
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleTitleSave}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle(column.title);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              className="flex-1 truncate cursor-pointer"
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </div>
          )}
        </div>

        {/* Column Actions */}
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground mr-2 bg-background/80 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMoveRight}
              disabled={!canMoveRight}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Title
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Brush className="h-4 w-4 mr-2" />
                  Change Color
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-2">
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {columnColors.map((color) => (
                      <div
                        key={color}
                        className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        title={color} // Add title for color identification
                      />
                    ))}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Container with improved drop target styling */}
      <div
        className={`p-2 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] min-h-[100px] ${
          isDragOver ? "bg-primary/5" : ""
        }`}
      >
        {cards.length > 0 ? (
          <div className="space-y-2">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={
                  draggedOverIndex === index
                    ? "border-t-2 border-primary bg-primary/10 rounded-md"
                    : ""
                }
              >
                <KanbanCardComponent
                  card={card}
                  onUpdate={(data) => onCardUpdate(card.id, data)}
                  onDelete={() => onCardDelete(card.id)}
                  columnsMap={columnsMap}
                  onMoveToColumn={(destinationColumnId) =>
                    onMoveCard(card.id, column.id, destinationColumnId)
                  }
                  onDragOver={() => handleCardDragOver(index)}
                  highlightOverdue={highlightOverdue}
                  sourceColumnId={column.id} // Pass source column ID for better tracking
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-md h-full flex items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            Drop cards here
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setNewCardDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>

      {/* New Card Dialog */}
      <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new card</DialogTitle>
            <DialogDescription>
              Create a new card for this column.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                placeholder="Card description"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCard}>Create Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Column Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column? All cards in this
              column will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
