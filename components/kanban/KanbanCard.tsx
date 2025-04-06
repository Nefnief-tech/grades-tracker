"use client";

import React, { useState, useRef, DragEvent } from "react";
import { KanbanCard } from "@/types/kanban";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Edit,
  Trash,
  MoreVertical,
  ArrowRight,
  GripVertical,
  CheckCircle,
  Clock,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface KanbanCardProps {
  card: KanbanCard;
  isOverlay?: boolean;
  onUpdate: (data: Partial<KanbanCard>) => Promise<KanbanCard>;
  onDelete: () => Promise<boolean>;
  columnsMap?: Record<string, string>; // Map of other column IDs to titles
  onMoveToColumn?: (columnId: string) => void;
  onDragStart?: (e: DragEvent<HTMLDivElement>, card: KanbanCard) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>, cardId: string) => void;
  highlightOverdue?: boolean;
  sourceColumnId?: string; // Source column ID for tracking during drag
}

export function KanbanCardComponent({
  card,
  isOverlay = false,
  onUpdate,
  onDelete,
  columnsMap = {},
  onMoveToColumn,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  highlightOverdue = true,
  sourceColumnId,
}: KanbanCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || "medium");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.split("T")[0] : ""
  );
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(card.completed || false);

  const cardRef = useRef<HTMLDivElement>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-200 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400";
      case "medium":
        return "bg-amber-200 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400";
      case "low":
        return "bg-green-200 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400";
      case "critical":
        return "bg-rose-200 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400";
      case "normal":
        return "bg-blue-200 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400";
      case "minimal":
        return "bg-teal-200 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-400";
      default:
        return "bg-blue-200 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400";
    }
  };

  const getDueStatus = () => {
    if (!card.dueDate) return null;

    const dueDate = parseISO(card.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isBefore(dueDate, today)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (dueDate.getTime() === today.getTime()) {
      return <Badge>Due Today</Badge>;
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return <Badge variant="outline">Due Tomorrow</Badge>;
    }

    return <Badge variant="outline">{format(dueDate, "MMM d")}</Badge>;
  };

  // Check if card is due soon (within 2 days)
  const isDueSoon =
    card.dueDate && !isCompleted
      ? isBefore(parseISO(card.dueDate), addDays(new Date(), 2)) &&
        isAfter(parseISO(card.dueDate), new Date())
      : false;

  // Check if card is overdue
  const isOverdue =
    card.dueDate && !isCompleted
      ? isBefore(parseISO(card.dueDate), new Date())
      : false;

  // Get border color based on priority and due state with enhanced colors
  const getBorderColor = () => {
    if (isCompleted) return "border-gray-300 dark:border-gray-700";
    if (highlightOverdue && isOverdue)
      return "border-red-500 dark:border-red-600";
    if (highlightOverdue && isDueSoon)
      return "border-amber-500 dark:border-amber-600";

    switch (card.priority) {
      case "high":
        return "border-red-400 dark:border-red-800";
      case "medium":
        return "border-amber-400 dark:border-amber-800";
      case "low":
        return "border-green-400 dark:border-green-800";
      case "critical":
        return "border-rose-400 dark:border-rose-800";
      case "normal":
        return "border-blue-400 dark:border-blue-800";
      case "minimal":
        return "border-teal-400 dark:border-teal-800";
      default:
        return "border-gray-300 dark:border-gray-700";
    }
  };

  // Toggle completion status
  const toggleCompleted = async () => {
    try {
      const newCompletedState = !isCompleted;
      setIsCompleted(newCompletedState);
      await onUpdate({ completed: newCompletedState });
    } catch (error) {
      setIsCompleted(isCompleted); // Revert on error
      console.error("Failed to update completion status", error);
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the card",
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as "low" | "medium" | "high",
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setEditDialogOpen(false);
      toast({
        description: "Card updated successfully",
      });
    } catch (error) {
      console.error("Failed to update card:", error);
      toast({
        title: "Update failed",
        description: "Failed to update card",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await onDelete();
      setDeleteDialogOpen(false);
      toast({
        description: "Card deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete card",
        variant: "destructive",
      });
    }
  };

  // Improved drag start with better source column tracking
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Clear any existing data
    e.dataTransfer.clearData();

    // Set the critical data
    e.dataTransfer.setData("text/plain", card.id);
    if (sourceColumnId) {
      e.dataTransfer.setData("source-column", sourceColumnId);
    }
    e.dataTransfer.effectAllowed = "move";

    // Improved drag image
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        cardRef.current,
        rect.width / 2,
        rect.height / 2
      );
    }

    // Add a delay to set isDragging to true for visual feedback
    setTimeout(() => setIsDragging(true), 0);

    // Log for debugging
    console.log(
      `Started dragging card ${card.id} from column ${sourceColumnId}`
    );

    if (onDragStart) {
      onDragStart(e, card);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e, card.id);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "bg-card border rounded-md p-3 shadow-sm hover:shadow relative transition-all",
          getBorderColor(),
          isDragging && "opacity-50 border-dashed",
          isOverlay && "shadow-md",
          isCompleted && "opacity-60",
          "border-2" // Make border thicker for better visibility
        )}
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-2">
            {/* Completion checkbox */}
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer flex items-center justify-center",
                isCompleted
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300"
              )}
              onClick={toggleCompleted}
            >
              {isCompleted && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>

            {/* Card title with completed styling */}
            <div className="flex items-start">
              <div className="text-muted-foreground flex items-center cursor-grab mt-0.5">
                <GripVertical className="h-4 w-4" />
              </div>
              <h3
                className={cn(
                  "font-medium text-sm ml-1",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {card.title}
              </h3>
            </div>
          </div>

          {!isOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2 -mt-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Card
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleCompleted}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as {isCompleted ? "Incomplete" : "Complete"}
                </DropdownMenuItem>

                {onMoveToColumn && Object.keys(columnsMap).length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to Column
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Object.entries(columnsMap).map(
                        ([columnId, columnTitle]) => (
                          <DropdownMenuItem
                            key={columnId}
                            onClick={() => onMoveToColumn(columnId)}
                          >
                            {columnTitle}
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {card.description && (
          <p
            className={cn(
              "text-xs text-muted-foreground mt-2 line-clamp-3",
              isCompleted && "opacity-70"
            )}
          >
            {card.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 gap-2">
          <div className="flex gap-1 flex-wrap">
            {card.priority && (
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(card.priority))}
              >
                {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
              </Badge>
            )}

            {card.labels &&
              card.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
          </div>

          {card.dueDate && (
            <div
              className={cn(
                "flex items-center text-xs gap-1 font-medium",
                isOverdue && highlightOverdue ? "text-red-500" : "",
                isDueSoon && highlightOverdue ? "text-amber-500" : "",
                isCompleted ? "text-muted-foreground" : ""
              )}
            >
              <Clock className="h-3 w-3" />
              {format(parseISO(card.dueDate), "MMM d")}
            </div>
          )}
        </div>

        {/* Add an indicator if card has a linked subject */}
        {card.subjectId && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-1"></div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Make changes to your card details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Card description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Due Date (optional)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
