"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useKanbanBoards, useKanbanBoard } from "@/hooks/useKanbanBoard";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Layout, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Empty } from "@/components/Empty";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function KanbanPage() {
  const { user } = useAuth();
  const { boards, isLoading, createBoard, refetchBoards } = useKanbanBoards();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardDialogOpen, setNewBoardDialogOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const { toast } = useToast();

  // If there's only one board, select it automatically
  useEffect(() => {
    if (boards.length === 1 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  // Handle board creation
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) {
      toast({
        title: "Board title required",
        description: "Please enter a title for your board",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBoard = await createBoard({
        title: newBoardTitle.trim(),
        description: newBoardDescription.trim() || undefined,
      });

      setNewBoardTitle("");
      setNewBoardDescription("");
      setNewBoardDialogOpen(false);
      setSelectedBoardId(newBoard.id);

      toast({
        title: "Board created",
        description: "Your new Kanban board has been created successfully.",
      });
    } catch (error) {
      console.error("Failed to create board:", error);
      toast({
        title: "Failed to create board",
        description: "There was an error creating your board.",
        variant: "destructive",
      });
    }
  };

  // Return to board selection
  const handleBackToBoards = () => {
    setSelectedBoardId(null);
  };

  // If loading, show skeleton loading UI
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show board selector if no board is selected
  if (!selectedBoardId) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layout className="h-7 w-7" />
            <span>Kanban Boards</span>
          </h1>
          <Button onClick={() => setNewBoardDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>

        {boards.length === 0 ? (
          <Empty
            icon={<Layout className="h-12 w-12 text-muted-foreground" />}
            title="No boards yet"
            description="Create your first Kanban board to get started"
            action={
              <Button onClick={() => setNewBoardDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedBoardId(board.id)}
              >
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                  {board.description && (
                    <CardDescription>{board.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    Open Board
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* New Board Dialog */}
        <Dialog open={newBoardDialogOpen} onOpenChange={setNewBoardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new board</DialogTitle>
              <DialogDescription>
                Create a new Kanban board to organize your tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Board Title</label>
                <Input
                  placeholder="e.g. Project Management, Study Plan"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Board description"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setNewBoardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateBoard}>Create Board</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If a board is selected, render the board
  return (
    <KanbanBoardView boardId={selectedBoardId} onBack={handleBackToBoards} />
  );
}

function KanbanBoardView({
  boardId,
  onBack,
}: {
  boardId: string;
  onBack: () => void;
}) {
  const {
    board,
    columns,
    cards,
    isLoading,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  } = useKanbanBoard(boardId);

  // Improved move card handler with additional error handling and deduplication
  const handleMoveCard = async (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destIndex: number
  ) => {
    console.log(
      `Moving card ${cardId} from column ${sourceColumnId} to ${destinationColumnId} at index ${destIndex}`
    );

    // Early return if source and destination are the same
    if (sourceColumnId === destinationColumnId) {
      console.log("Source and destination columns are the same, skipping");
      return;
    }

    try {
      // Check if source and destination columns exist
      if (!cards[sourceColumnId]) {
        console.error(`Source column ${sourceColumnId} not found`);
        return;
      }

      if (!cards[destinationColumnId]) {
        console.error(`Destination column ${destinationColumnId} not found`);
        return;
      }

      // Make sure we have the card in the source column
      const cardToMove = cards[sourceColumnId].find(
        (card) => card.id === cardId
      );

      if (!cardToMove) {
        console.error(
          `Card ${cardId} not found in source column ${sourceColumnId}`
        );
        return;
      }

      // Check if card already exists in destination column to prevent duplicate
      if (cards[destinationColumnId].some((card) => card.id === cardId)) {
        console.error(
          `Card ${cardId} already exists in destination column, skipping move`
        );
        return;
      }

      // Call moveCard with all parameters
      await moveCard(cardId, sourceColumnId, destinationColumnId, destIndex);
    } catch (error) {
      console.error("Error moving card:", error);
    }
  };

  if (isLoading || !board) {
    return (
      <div className="container py-10">
        <div className="h-8 w-full bg-muted animate-pulse rounded mb-8"></div>
        <div className="h-[calc(100vh-200px)] bg-muted/50 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Button}
              variant="link"
              className="p-0"
              onClick={onBack}
            >
              Boards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{board.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="text-muted-foreground mt-1">{board.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <KanbanBoard
          columns={columns}
          cards={cards}
          isLoading={isLoading}
          onColumnCreate={createColumn}
          onColumnUpdate={updateColumn}
          onColumnDelete={deleteColumn}
          onColumnReorder={reorderColumns}
          onCardCreate={createCard}
          onCardUpdate={updateCard}
          onCardDelete={deleteCard}
          onCardMove={handleMoveCard}
        />
      </div>
    </div>
  );
}
