"use client";

import React, { useState } from "react";
import { KanbanColumn as ColumnType, KanbanCard } from "@/types/kanban";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/Empty";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { KanbanCardComponent } from "./KanbanCard";
import {
  GripVertical,
  MoreVertical,
  Plus,
  ArrowLeft,
  ArrowRight,
  X,
  Calendar,
  Tag,
  ChevronDown,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface KanbanColumnProps {
  column: ColumnType;
  cards: KanbanCard[];
  onCardCreate: (data: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    subjectId?: string;
    labels?: string[];
  }) => Promise<KanbanCard>;
  onCardUpdate: (id: string, data: Partial<KanbanCard>) => Promise<KanbanCard>;
  onCardDelete: (id: string) => Promise<boolean>;
  onColumnUpdate: (data: Partial<ColumnType>) => Promise<ColumnType>;
  onColumnDelete: () => Promise<boolean>;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  columnsMap: Record<string, string>;
  onMoveCard: (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string
  ) => Promise<any>;
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
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [newCardData, setNewCardData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [editedColumnTitle, setEditedColumnTitle] = useState(column.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Handle creating a new card
  const handleCreateCard = async () => {
    if (!newCardData.title.trim()) {
      toast({
        title: "Card title required",
        description: "Please enter a title for the card",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const cardData = {
        ...newCardData,
        dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      };

      await onCardCreate(cardData);
      setNewCardData({
        title: "",
        description: "",
        priority: "medium",
      });
      setSelectedDate(undefined);
      setNewCardDialogOpen(false);
      toast({
        title: "Card created",
        description: "Your new card has been created.",
      });
    } catch (error) {
      console.error("Failed to create card:", error);
      toast({
        title: "Failed to create card",
        description: "There was an error creating your card.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating the column title
  const handleUpdateColumn = async () => {
    if (!editedColumnTitle.trim()) {
      toast({
        title: "Column title required",
        description: "Please enter a title for the column",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onColumnUpdate({ title: editedColumnTitle.trim() });
      setEditColumnDialogOpen(false);
      toast({
        title: "Column updated",
        description: "Your column has been updated.",
      });
    } catch (error) {
      console.error("Failed to update column:", error);
      toast({
        title: "Failed to update column",
        description: "There was an error updating your column.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a column with confirmation
  const handleDeleteColumn = async () => {
    if (window.confirm(`Are you sure you want to delete "${column.title}"?`)) {
      try {
        const success = await onColumnDelete();
        if (success) {
          toast({
            title: "Column deleted",
            description: "Your column has been deleted.",
          });
        } else {
          toast({
            title: "Failed to delete column",
            description: "There was an error deleting your column.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to delete column:", error);
        toast({
          title: "Failed to delete column",
          description: "There was an error deleting your column.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-background rounded-md border shadow">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <h3 className="font-medium text-sm flex-grow truncate">
            {column.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {cards.length}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setEditColumnDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit column
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteColumn}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onMoveLeft} disabled={!canMoveLeft}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Move left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMoveRight} disabled={!canMoveRight}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Move right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea
        className="flex-grow p-2"
        style={{ height: "calc(100vh - 260px)" }}
      >
        {cards.length === 0 ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            No cards yet
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <KanbanCardComponent
                key={card.id}
                card={card}
                onUpdate={(data) => onCardUpdate(card.id, data)}
                onDelete={() => onCardDelete(card.id)}
                columnsMap={columnsMap}
                currentColumnId={column.id}
                onMoveCard={onMoveCard}
                highlightOverdue={highlightOverdue}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setNewCardDialogOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add a card
        </Button>
      </div>

      {/* Add new card dialog */}
      <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new card</DialogTitle>
            <DialogDescription>
              Create a new card for the "{column.title}" column.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                value={newCardData.title}
                onChange={(e) =>
                  setNewCardData({ ...newCardData, title: e.target.value })
                }
                placeholder="Enter card title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newCardData.description}
                onChange={(e) =>
                  setNewCardData({
                    ...newCardData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter card description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={newCardData.priority}
                  onValueChange={(value) =>
                    setNewCardData({
                      ...newCardData,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCardDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCard} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit column dialog */}
      <Dialog
        open={editColumnDialogOpen}
        onOpenChange={setEditColumnDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit column</DialogTitle>
            <DialogDescription>
              Change the title of this column.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="columnTitle" className="text-sm font-medium">
                Column Title
              </label>
              <Input
                id="columnTitle"
                value={editedColumnTitle}
                onChange={(e) => setEditedColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditColumnDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateColumn} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
