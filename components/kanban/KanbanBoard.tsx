"use client";

import React, { useState, useEffect } from "react";
import { KanbanColumn, KanbanCard } from "@/types/kanban";
import { KanbanColumn as ColumnComponent } from "./KanbanColumn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Monitor, Filter, SortAsc } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/Empty";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: { [columnId: string]: KanbanCard[] };
  isLoading: boolean;
  onColumnCreate: (data: { title: string }) => Promise<KanbanColumn>;
  onColumnUpdate: (
    id: string,
    data: Partial<KanbanColumn>
  ) => Promise<KanbanColumn>;
  onColumnDelete: (id: string) => Promise<boolean>;
  onColumnReorder: (newOrder: KanbanColumn[]) => Promise<KanbanColumn[]>;
  onCardCreate: (
    columnId: string,
    data: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
      subjectId?: string;
      labels?: string[];
    }
  ) => Promise<KanbanCard>;
  onCardUpdate: (id: string, data: Partial<KanbanCard>) => Promise<KanbanCard>;
  onCardDelete: (id: string) => Promise<boolean>;
  onCardMove: (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    index: number
  ) => Promise<any>;
}

export function KanbanBoard({
  columns,
  cards,
  isLoading,
  onColumnCreate,
  onColumnUpdate,
  onColumnDelete,
  onColumnReorder,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onCardMove,
}: KanbanBoardProps) {
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const { toast } = useToast();
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [sortCardsByDueDate, setSortCardsByDueDate] = useState<boolean>(false);
  const [sortCardsByPriority, setSortCardsByPriority] =
    useState<boolean>(false);
  const [highlightOverdue, setHighlightOverdue] = useState<boolean>(true);

  // Track total cards for display
  const totalCards = Object.values(cards).reduce(
    (sum, columnCards) => sum + columnCards.length,
    0
  );

  // Filter cards based on criteria
  const filteredCards = { ...cards };
  if (filterPriority) {
    Object.keys(filteredCards).forEach((columnId) => {
      filteredCards[columnId] = filteredCards[columnId].filter(
        (card) => card.priority === filterPriority
      );
    });
  }

  // Sort cards if enabled
  useEffect(() => {
    if (sortCardsByDueDate || sortCardsByPriority) {
      const priorityValues = { high: 0, medium: 1, low: 2 };

      const sortedCards = { ...cards };
      Object.keys(sortedCards).forEach((columnId) => {
        sortedCards[columnId] = [...sortedCards[columnId]].sort((a, b) => {
          // First by priority if enabled
          if (sortCardsByPriority) {
            const aPriority = a.priority || "medium";
            const bPriority = b.priority || "medium";
            const priorityDiff =
              priorityValues[aPriority as keyof typeof priorityValues] -
              priorityValues[bPriority as keyof typeof priorityValues];
            if (priorityDiff !== 0) return priorityDiff;
          }

          // Then by due date if enabled
          if (sortCardsByDueDate) {
            if (a.dueDate && b.dueDate) {
              return (
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              );
            }
            if (a.dueDate) return -1; // a has due date, b doesn't
            if (b.dueDate) return 1; // b has due date, a doesn't
          }

          // Keep original order if no sorting criteria match
          return a.order - b.order;
        });
      });
    }
  }, [sortCardsByDueDate, sortCardsByPriority, cards]);

  // Create new column
  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast({
        title: "Column title required",
        description: "Please enter a title for the column",
        variant: "destructive",
      });
      return;
    }

    try {
      await onColumnCreate({ title: newColumnTitle.trim() });
      setNewColumnTitle("");
      setNewColumnDialogOpen(false);

      toast({
        title: "Column created",
        description: "Your new column has been created.",
      });
    } catch (error) {
      console.error("Failed to create column:", error);
      toast({
        title: "Failed to create column",
        description: "There was an error creating your column.",
        variant: "destructive",
      });
    }
  };

  // Simple column reordering using move left/right buttons
  const moveColumn = async (columnId: string, direction: "left" | "right") => {
    const columnIndex = columns.findIndex((col) => col.id === columnId);
    if (columnIndex === -1) return;

    let newIndex = direction === "left" ? columnIndex - 1 : columnIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= columns.length) return;

    const newColumns = [...columns];
    const [removed] = newColumns.splice(columnIndex, 1);
    newColumns.splice(newIndex, 0, removed);

    // Update order property
    const reordered = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    await onColumnReorder(reordered);
  };

  // Move a card between columns manually - Fixed to prevent duplication
  const handleMoveCard = async (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string
  ) => {
    if (sourceColumnId === destinationColumnId) return;

    // Find the card in the source column
    const card = cards[sourceColumnId]?.find((c) => c.id === cardId);
    if (!card) {
      console.error(
        `Card ${cardId} not found in source column ${sourceColumnId}`
      );
      return;
    }

    // Check if card already exists in destination to prevent duplicate
    if (cards[destinationColumnId]?.some((c) => c.id === cardId)) {
      console.error(
        `Card ${cardId} already exists in destination column ${destinationColumnId}`
      );
      return;
    }

    // Get target index (at the end of destination column)
    const destIndex = cards[destinationColumnId]?.length || 0;

    // Log the move for debugging
    console.log(
      `Moving card ${cardId} from ${sourceColumnId} to ${destinationColumnId} at index ${destIndex}`
    );

    try {
      // Call onCardMove and wait for it to complete
      await onCardMove(cardId, sourceColumnId, destinationColumnId, destIndex);
    } catch (error) {
      console.error("Error moving card:", error);
      toast({
        title: "Failed to move card",
        description: "There was an error moving the card.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <Skeleton className="h-12 w-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <Badge variant="outline" className="text-xs">
              {totalCards} {totalCards === 1 ? "card" : "cards"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {columns.length} {columns.length === 1 ? "column" : "columns"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="font-medium text-primary" disabled>
                Priority Filter
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={filterPriority === null}
                onCheckedChange={() => setFilterPriority(null)}
              >
                All Priorities
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPriority === "high"}
                onCheckedChange={() =>
                  setFilterPriority(filterPriority === "high" ? null : "high")
                }
              >
                High Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPriority === "medium"}
                onCheckedChange={() =>
                  setFilterPriority(
                    filterPriority === "medium" ? null : "medium"
                  )
                }
              >
                Medium Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterPriority === "low"}
                onCheckedChange={() =>
                  setFilterPriority(filterPriority === "low" ? null : "low")
                }
              >
                Low Priority
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-medium text-primary" disabled>
                Display Options
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={highlightOverdue}
                onCheckedChange={(checked) => setHighlightOverdue(!!checked)}
              >
                Highlight Overdue Tasks
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortCardsByPriority}
                onCheckedChange={(checked) => setSortCardsByPriority(!!checked)}
              >
                Sort by Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortCardsByDueDate}
                onCheckedChange={(checked) => setSortCardsByDueDate(!!checked)}
              >
                Sort by Due Date
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add column button */}
          <Button onClick={() => setNewColumnDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Column
          </Button>
        </div>
      </div>

      {columns.length === 0 ? (
        <Empty
          icon={<Monitor className="h-12 w-12 text-muted-foreground" />}
          title="No columns yet"
          description="Create a column to get started with your Kanban board"
          action={
            <Button onClick={() => setNewColumnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Column
            </Button>
          }
        />
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)] overflow-x-auto flex pb-4 -mx-4 px-4">
          {/* Drop area indicator during drag */}
          <div className="flex gap-4 min-h-[200px]">
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                cards={filteredCards[column.id] || []}
                onCardCreate={(data) => onCardCreate(column.id, data)}
                onCardUpdate={onCardUpdate}
                onCardDelete={onCardDelete}
                onColumnUpdate={(data) => onColumnUpdate(column.id, data)}
                onColumnDelete={() => onColumnDelete(column.id)}
                onMoveLeft={() => moveColumn(column.id, "left")}
                onMoveRight={() => moveColumn(column.id, "right")}
                canMoveLeft={columns.indexOf(column) > 0}
                canMoveRight={columns.indexOf(column) < columns.length - 1}
                columnsMap={columns.reduce((acc, col) => {
                  if (col.id !== column.id) acc[col.id] = col.title;
                  return acc;
                }, {} as Record<string, string>)}
                onMoveCard={handleMoveCard}
                highlightOverdue={highlightOverdue}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* New Column Dialog */}
      <Dialog open={newColumnDialogOpen} onOpenChange={setNewColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new column</DialogTitle>
            <DialogDescription>
              Create a new column for your Kanban board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="columnTitle" className="text-sm font-medium">
                Column Title
              </label>
              <Input
                id="columnTitle"
                placeholder="e.g. To Do, In Progress, Done"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateColumn();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewColumnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateColumn}>Create Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
