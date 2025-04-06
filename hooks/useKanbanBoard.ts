import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanBoard, KanbanColumn, KanbanCard } from "@/types/kanban";
import { generateId } from "@/utils/idUtils";
import {
  saveBoardToCloud,
  getBoardsFromCloud,
  deleteBoardFromCloud,
  saveColumnToCloud,
  getColumnsFromCloud,
  deleteColumnFromCloud,
  saveCardToCloud,
  getCardsForColumnFromCloud,
  deleteCardFromCloud,
} from "@/utils/kanbanCloudSync";

// Key for local storage
const BOARDS_STORAGE_KEY = "kanbanBoards";
const COLUMNS_STORAGE_KEY = "kanbanColumns";
const CARDS_STORAGE_KEY = "kanbanCards";

export function useKanbanBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all boards
  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get from local storage
      let storedBoards: KanbanBoard[] = [];
      const boardsJson = localStorage.getItem(BOARDS_STORAGE_KEY);
      if (boardsJson) {
        storedBoards = JSON.parse(boardsJson);
      }

      // If user is logged in, try to get from cloud
      if (user?.id && user?.encryptionKey) {
        try {
          const cloudBoards = await getBoardsFromCloud(
            user.id,
            user.encryptionKey
          );

          if (cloudBoards && cloudBoards.length > 0) {
            storedBoards = cloudBoards;
            localStorage.setItem(
              BOARDS_STORAGE_KEY,
              JSON.stringify(cloudBoards)
            );
          } else if (storedBoards.length > 0 && user.syncEnabled) {
            // If we have local boards but none in the cloud, sync them up
            for (const board of storedBoards) {
              await saveBoardToCloud(user.id, board, user.encryptionKey);
            }
          }
        } catch (cloudError) {
          console.error("Failed to fetch boards from cloud:", cloudError);
        }
      }

      setBoards(storedBoards);
    } catch (err) {
      console.error("Error fetching kanban boards:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load kanban boards")
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load boards on mount and when user changes
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Create a new board
  const createBoard = useCallback(
    async (
      boardData: Omit<KanbanBoard, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      try {
        const now = new Date().toISOString();
        const newBoard: KanbanBoard = {
          id: generateId(),
          userId: user?.id || "anonymous",
          ...boardData,
          createdAt: now,
          updatedAt: now,
        };

        // Update state and local storage
        const updatedBoards = [...boards, newBoard];
        setBoards(updatedBoards);
        localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(updatedBoards));

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveBoardToCloud(user.id, newBoard, user.encryptionKey);
        }

        return newBoard;
      } catch (err) {
        console.error("Error creating board:", err);
        throw err;
      }
    },
    [boards, user]
  );

  // Update an existing board
  const updateBoard = useCallback(
    async (boardId: string, boardData: Partial<KanbanBoard>) => {
      try {
        const boardIndex = boards.findIndex((board) => board.id === boardId);
        if (boardIndex === -1) {
          throw new Error(`Board with ID ${boardId} not found`);
        }

        const updatedBoard: KanbanBoard = {
          ...boards[boardIndex],
          ...boardData,
          updatedAt: new Date().toISOString(),
        };

        const updatedBoards = [...boards];
        updatedBoards[boardIndex] = updatedBoard;

        setBoards(updatedBoards);
        localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(updatedBoards));

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveBoardToCloud(user.id, updatedBoard, user.encryptionKey);
        }

        return updatedBoard;
      } catch (err) {
        console.error("Error updating board:", err);
        throw err;
      }
    },
    [boards, user]
  );

  // Delete a board
  const deleteBoard = useCallback(
    async (boardId: string) => {
      try {
        const filteredBoards = boards.filter((board) => board.id !== boardId);
        setBoards(filteredBoards);
        localStorage.setItem(
          BOARDS_STORAGE_KEY,
          JSON.stringify(filteredBoards)
        );

        // Remove columns and cards for this board from local storage
        const columnsJson = localStorage.getItem(COLUMNS_STORAGE_KEY);
        if (columnsJson) {
          const columns = JSON.parse(columnsJson);
          const filteredColumns = columns.filter(
            (column: KanbanColumn) => column.boardId !== boardId
          );
          localStorage.setItem(
            COLUMNS_STORAGE_KEY,
            JSON.stringify(filteredColumns)
          );
        }

        // Delete from cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await deleteBoardFromCloud(user.id, boardId);
        }

        return true;
      } catch (err) {
        console.error("Error deleting board:", err);
        throw err;
      }
    },
    [boards, user]
  );

  return {
    boards,
    isLoading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    refetchBoards: fetchBoards,
  };
}

export function useKanbanBoard(boardId: string) {
  const { user } = useAuth();
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<{ [columnId: string]: KanbanCard[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch a specific board and its columns and cards
  const fetchBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get board from local storage
      let storedBoard: KanbanBoard | null = null;
      const boardsJson = localStorage.getItem(BOARDS_STORAGE_KEY);
      if (boardsJson) {
        const boards: KanbanBoard[] = JSON.parse(boardsJson);
        storedBoard = boards.find((b) => b.id === boardId) || null;
      }

      // Get columns from local storage
      let storedColumns: KanbanColumn[] = [];
      const columnsJson = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (columnsJson) {
        const allColumns: KanbanColumn[] = JSON.parse(columnsJson);
        storedColumns = allColumns.filter((c) => c.boardId === boardId);
      }

      // Get cards from local storage
      let storedCards: { [columnId: string]: KanbanCard[] } = {};
      const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
      if (cardsJson) {
        const allCards: KanbanCard[] = JSON.parse(cardsJson);

        // Group cards by column
        storedColumns.forEach((column) => {
          storedCards[column.id] = allCards
            .filter((card) => card.columnId === column.id)
            .sort((a, b) => a.order - b.order);
        });
      }

      // If user is logged in, try to get data from cloud
      if (user?.id && user?.encryptionKey) {
        try {
          // First try to get the board - check if it exists in the cloud
          const cloudBoards = await getBoardsFromCloud(
            user.id,
            user.encryptionKey
          );
          const cloudBoard = cloudBoards.find((b) => b.id === boardId);

          if (cloudBoard) {
            storedBoard = cloudBoard;

            // Then get columns from the cloud
            const cloudColumns = await getColumnsFromCloud(
              boardId,
              user.encryptionKey
            );

            if (cloudColumns.length > 0) {
              storedColumns = cloudColumns;

              // Then get cards for each column
              const cloudCards: { [columnId: string]: KanbanCard[] } = {};
              for (const column of cloudColumns) {
                const columnCards = await getCardsForColumnFromCloud(
                  column.id,
                  user.encryptionKey
                );
                cloudCards[column.id] = columnCards;
              }

              if (Object.keys(cloudCards).length > 0) {
                storedCards = cloudCards;
              }

              // Save cloud data to local storage
              const allBoardsJson = localStorage.getItem(BOARDS_STORAGE_KEY);
              if (allBoardsJson) {
                const allBoards = JSON.parse(allBoardsJson);
                const boardIndex = allBoards.findIndex(
                  (b: KanbanBoard) => b.id === boardId
                );
                if (boardIndex >= 0) {
                  allBoards[boardIndex] = cloudBoard;
                } else {
                  allBoards.push(cloudBoard);
                }
                localStorage.setItem(
                  BOARDS_STORAGE_KEY,
                  JSON.stringify(allBoards)
                );
              }

              localStorage.setItem(
                COLUMNS_STORAGE_KEY,
                JSON.stringify(storedColumns)
              );

              // Save all cards in a flat array
              const allCards = Object.values(storedCards).flat();
              localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(allCards));
            }
          }
        } catch (cloudError) {
          console.error("Failed to fetch board data from cloud:", cloudError);
        }
      }

      setBoard(storedBoard);
      setColumns(storedColumns.sort((a, b) => a.order - b.order));
      setCards(storedCards);
    } catch (err) {
      console.error("Error fetching kanban board:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load kanban board")
      );
    } finally {
      setIsLoading(false);
    }
  }, [boardId, user]);

  // Load board, columns, and cards on mount and when boardId changes
  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId, fetchBoard]);

  // Create a new column
  const createColumn = useCallback(
    async (
      columnData: Omit<KanbanColumn, "id" | "boardId" | "createdAt" | "order">
    ) => {
      if (!boardId) throw new Error("Board ID is required");

      try {
        const newColumn: KanbanColumn = {
          id: generateId(),
          boardId,
          ...columnData,
          order: columns.length,
          createdAt: new Date().toISOString(),
        };

        // Update state
        const updatedColumns = [...columns, newColumn];
        setColumns(updatedColumns);
        setCards({ ...cards, [newColumn.id]: [] });

        // Update local storage
        localStorage.setItem(
          COLUMNS_STORAGE_KEY,
          JSON.stringify(updatedColumns)
        );

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveColumnToCloud(user.id, newColumn, user.encryptionKey);
        }

        return newColumn;
      } catch (err) {
        console.error("Error creating column:", err);
        throw err;
      }
    },
    [boardId, columns, cards, user]
  );

  // Update a column
  const updateColumn = useCallback(
    async (columnId: string, columnData: Partial<KanbanColumn>) => {
      try {
        const columnIndex = columns.findIndex((col) => col.id === columnId);
        if (columnIndex === -1) {
          throw new Error(`Column with ID ${columnId} not found`);
        }

        const updatedColumn: KanbanColumn = {
          ...columns[columnIndex],
          ...columnData,
        };

        const updatedColumns = [...columns];
        updatedColumns[columnIndex] = updatedColumn;

        setColumns(updatedColumns);
        localStorage.setItem(
          COLUMNS_STORAGE_KEY,
          JSON.stringify(updatedColumns)
        );

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveColumnToCloud(user.id, updatedColumn, user.encryptionKey);
        }

        return updatedColumn;
      } catch (err) {
        console.error("Error updating column:", err);
        throw err;
      }
    },
    [columns, user]
  );

  // Delete a column
  const deleteColumn = useCallback(
    async (columnId: string) => {
      try {
        // Remove the column
        const filteredColumns = columns.filter((col) => col.id !== columnId);

        // Update order for remaining columns
        const reorderedColumns = filteredColumns.map((col, index) => ({
          ...col,
          order: index,
        }));

        setColumns(reorderedColumns);

        // Remove the column's cards from state
        const updatedCards = { ...cards };
        delete updatedCards[columnId];
        setCards(updatedCards);

        // Update local storage
        localStorage.setItem(
          COLUMNS_STORAGE_KEY,
          JSON.stringify(reorderedColumns)
        );

        // Update cards in local storage
        const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
        if (cardsJson) {
          const allCards = JSON.parse(cardsJson);
          const filteredCards = allCards.filter(
            (card: KanbanCard) => card.columnId !== columnId
          );
          localStorage.setItem(
            CARDS_STORAGE_KEY,
            JSON.stringify(filteredCards)
          );
        }

        // Sync to cloud if user is logged in
        if (user?.id && user?.syncEnabled) {
          if (boardId) {
            await deleteColumnFromCloud(columnId, boardId);
          }
        }

        return true;
      } catch (err) {
        console.error("Error deleting column:", err);
        throw err;
      }
    },
    [boardId, columns, cards, user]
  );

  // Reorder columns
  const reorderColumns = useCallback(
    async (newOrder: KanbanColumn[]) => {
      try {
        const updatedColumns = newOrder.map((col, index) => ({
          ...col,
          order: index,
        }));

        setColumns(updatedColumns);
        localStorage.setItem(
          COLUMNS_STORAGE_KEY,
          JSON.stringify(updatedColumns)
        );

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          for (const column of updatedColumns) {
            await saveColumnToCloud(user.id, column, user.encryptionKey);
          }
        }

        return updatedColumns;
      } catch (err) {
        console.error("Error reordering columns:", err);
        throw err;
      }
    },
    [user]
  );

  // Create a new card
  const createCard = useCallback(
    async (
      columnId: string,
      cardData: Omit<
        KanbanCard,
        "id" | "columnId" | "createdAt" | "updatedAt" | "order"
      >
    ) => {
      try {
        const columnCards = cards[columnId] || [];

        const now = new Date().toISOString();
        const newCard: KanbanCard = {
          id: generateId(),
          columnId,
          ...cardData,
          order: columnCards.length,
          createdAt: now,
          updatedAt: now,
        };

        // Update state
        const updatedCards = {
          ...cards,
          [columnId]: [...columnCards, newCard],
        };
        setCards(updatedCards);

        // Update local storage
        const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
        let allCards: KanbanCard[] = [];
        if (cardsJson) {
          allCards = JSON.parse(cardsJson);
        }
        allCards.push(newCard);
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(allCards));

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveCardToCloud(user.id, newCard, user.encryptionKey);
        }

        return newCard;
      } catch (err) {
        console.error("Error creating card:", err);
        throw err;
      }
    },
    [cards, user]
  );

  // Update a card
  const updateCard = useCallback(
    async (cardId: string, cardData: Partial<KanbanCard>) => {
      try {
        // Find the card
        let foundCard: KanbanCard | null = null;
        let foundColumnId: string | null = null;

        for (const [columnId, columnCards] of Object.entries(cards)) {
          const card = columnCards.find((c) => c.id === cardId);
          if (card) {
            foundCard = card;
            foundColumnId = columnId;
            break;
          }
        }

        if (!foundCard || !foundColumnId) {
          throw new Error(`Card with ID ${cardId} not found`);
        }

        const updatedCard: KanbanCard = {
          ...foundCard,
          ...cardData,
          updatedAt: new Date().toISOString(),
        };

        // Check if the card is moving to a different column
        const targetColumnId = cardData.columnId || foundColumnId;

        let updatedCards = { ...cards };

        if (targetColumnId !== foundColumnId) {
          // Remove from old column
          updatedCards[foundColumnId] = updatedCards[foundColumnId].filter(
            (c) => c.id !== cardId
          );

          // Add to new column
          const targetColumnCards = updatedCards[targetColumnId] || [];
          updatedCards[targetColumnId] = [
            ...targetColumnCards,
            { ...updatedCard, columnId: targetColumnId },
          ];

          // Reorder cards in both columns
          updatedCards[foundColumnId] = updatedCards[foundColumnId].map(
            (card, index) => ({
              ...card,
              order: index,
            })
          );

          updatedCards[targetColumnId] = updatedCards[targetColumnId].map(
            (card, index) => ({
              ...card,
              order: index,
            })
          );
        } else {
          // Update in the same column
          const cardIndex = updatedCards[foundColumnId].findIndex(
            (c) => c.id === cardId
          );
          updatedCards[foundColumnId][cardIndex] = updatedCard;
        }

        setCards(updatedCards);

        // Update local storage
        const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
        if (cardsJson) {
          let allCards: KanbanCard[] = JSON.parse(cardsJson);
          const cardIndex = allCards.findIndex((c) => c.id === cardId);

          if (cardIndex >= 0) {
            allCards[cardIndex] = updatedCard;
          } else {
            allCards.push(updatedCard);
          }

          localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(allCards));
        }

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveCardToCloud(user.id, updatedCard, user.encryptionKey);
        }

        return updatedCard;
      } catch (err) {
        console.error("Error updating card:", err);
        throw err;
      }
    },
    [cards, user]
  );

  // Delete a card
  const deleteCard = useCallback(
    async (cardId: string) => {
      try {
        // Find the card
        let foundColumnId: string | null = null;

        for (const [columnId, columnCards] of Object.entries(cards)) {
          if (columnCards.some((card) => card.id === cardId)) {
            foundColumnId = columnId;
            break;
          }
        }

        if (!foundColumnId) {
          throw new Error(`Card with ID ${cardId} not found`);
        }

        // Update state
        const updatedCards = { ...cards };
        updatedCards[foundColumnId] = updatedCards[foundColumnId]
          .filter((card) => card.id !== cardId)
          .map((card, index) => ({ ...card, order: index })); // Re-order remaining cards

        setCards(updatedCards);

        // Update local storage
        const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
        if (cardsJson) {
          const allCards: KanbanCard[] = JSON.parse(cardsJson);
          const filteredCards = allCards.filter((card) => card.id !== cardId);
          localStorage.setItem(
            CARDS_STORAGE_KEY,
            JSON.stringify(filteredCards)
          );
        }

        // Sync to cloud if user is logged in
        if (user?.syncEnabled) {
          await deleteCardFromCloud(cardId);
        }

        return true;
      } catch (err) {
        console.error("Error deleting card:", err);
        throw err;
      }
    },
    [cards, user]
  );

  // Move card between columns or reorder within column - Fixed to prevent duplication
  const moveCard = useCallback(
    async (
      cardId: string,
      sourceColumnId: string,
      destinationColumnId: string,
      newIndex: number
    ) => {
      try {
        // Find the card in the source column
        const sourceCards = cards[sourceColumnId] || [];
        const cardToMove = sourceCards.find((card) => card.id === cardId);

        if (!cardToMove) {
          console.error(
            `Card ${cardId} not found in source column ${sourceColumnId}`
          );
          return null;
        }

        // Create an immutable copy of the cards state
        const updatedCards = JSON.parse(JSON.stringify(cards));

        // Remove card from source column
        updatedCards[sourceColumnId] = updatedCards[sourceColumnId].filter(
          (card) => card.id !== cardId
        );

        // Create updated card with new column ID
        const updatedCard = {
          ...cardToMove,
          columnId: destinationColumnId,
          updatedAt: new Date().toISOString(),
        };

        // Ensure destination column exists in our cards object
        if (!updatedCards[destinationColumnId]) {
          updatedCards[destinationColumnId] = [];
        }

        // Insert card at new index
        updatedCards[destinationColumnId].splice(newIndex, 0, updatedCard);

        // Update order of all cards in affected columns
        updatedCards[sourceColumnId] = updatedCards[sourceColumnId].map(
          (card, index) => ({
            ...card,
            order: index,
          })
        );

        updatedCards[destinationColumnId] = updatedCards[
          destinationColumnId
        ].map((card, index) => ({
          ...card,
          order: index,
        }));

        // Update state with the new cards - use immutable update pattern
        setCards(updatedCards);

        // Update local storage with a completely new array to avoid duplicates
        const allCards = [];
        Object.keys(updatedCards).forEach((colId) => {
          updatedCards[colId].forEach((card) => {
            // Verify card isn't already in the array
            if (!allCards.some((c) => c.id === card.id)) {
              allCards.push(card);
            }
          });
        });

        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(allCards));

        // Sync to cloud if user is logged in
        if (user?.id && user?.encryptionKey && user?.syncEnabled) {
          await saveCardToCloud(user.id, updatedCard, user.encryptionKey);

          // Update cards in source column
          for (const card of updatedCards[sourceColumnId]) {
            await saveCardToCloud(user.id, card, user.encryptionKey);
          }

          // Update cards in destination column
          for (const card of updatedCards[destinationColumnId]) {
            if (card.id !== cardId) {
              // Skip the already synced moved card
              await saveCardToCloud(user.id, card, user.encryptionKey);
            }
          }
        }

        return updatedCards;
      } catch (err) {
        console.error("Error moving card:", err);
        throw err;
      }
    },
    [cards, user]
  );

  return {
    board,
    columns,
    cards,
    isLoading,
    error,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    refetchBoard: fetchBoard,
  };
}
