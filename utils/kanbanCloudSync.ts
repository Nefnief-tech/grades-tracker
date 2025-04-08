import { ID, Query } from "appwrite";
import { KanbanBoard, KanbanColumn, KanbanCard } from "@/types/kanban";
import { encryptData, decryptData } from "@/utils/dataProtection";

// Get a reference to Appwrite client
const getAppwriteClient = async () => {
  // This re-uses the existing getAppwriteClient function from your app
  const { getAppwriteClient } = await import("@/utils/storageUtils");
  return getAppwriteClient();
};

// BOARD OPERATIONS
export async function saveBoardToCloud(
  userId: string,
  board: KanbanBoard,
  encryptionKey: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const encryptedData = await encryptData(board, encryptionKey);

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_BOARDS_COLLECTION_ID || "";

    try {
      const docs = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("boardId", board.id),
        Query.equal("userId", userId),
      ]);

      if (docs.documents.length > 0) {
        // Update existing document
        await databases.updateDocument(
          databaseId,
          collectionId,
          docs.documents[0]["$id"],
          {
            encryptedData: JSON.stringify(encryptedData),
            userId,
            boardId: board.id,
            title: board.title,
            lastUpdated: new Date().toISOString(),
          }
        );
      } else {
        // Create new document
        await databases.createDocument(databaseId, collectionId, ID.unique(), {
          encryptedData: JSON.stringify(encryptedData),
          userId,
          boardId: board.id,
          title: board.title,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      // If error in checking, try to create document
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        encryptedData: JSON.stringify(encryptedData),
        userId,
        boardId: board.id,
        title: board.title,
        lastUpdated: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving board to cloud:", error);
    return false;
  }
}

export async function getBoardsFromCloud(
  userId: string,
  encryptionKey: string
): Promise<KanbanBoard[]> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_BOARDS_COLLECTION_ID || "";

    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("userId", userId),
    ]);

    const boards: KanbanBoard[] = [];
    for (const doc of response.documents) {
      try {
        const encryptedData = JSON.parse(doc.encryptedData);
        const decryptedBoard = (await decryptData(
          encryptedData,
          encryptionKey
        )) as KanbanBoard;
        boards.push(decryptedBoard);
      } catch (error) {
        console.error(`Failed to decrypt board ${doc.boardId}:`, error);
      }
    }

    return boards;
  } catch (error) {
    console.error("Error getting boards from cloud:", error);
    return [];
  }
}

export async function deleteBoardFromCloud(
  userId: string,
  boardId: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_BOARDS_COLLECTION_ID || "";

    const docs = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("boardId", boardId),
      Query.equal("userId", userId),
    ]);

    if (docs.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        collectionId,
        docs.documents[0]["$id"]
      );
    }

    // Also delete all columns and cards for this board
    await deleteAllColumnsForBoardFromCloud(userId, boardId);

    return true;
  } catch (error) {
    console.error("Error deleting board from cloud:", error);
    return false;
  }
}

// COLUMN OPERATIONS
export async function saveColumnToCloud(
  userId: string,
  column: KanbanColumn,
  encryptionKey: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const encryptedData = await encryptData(column, encryptionKey);

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_COLUMNS_COLLECTION_ID || "";

    try {
      const docs = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("columnId", column.id),
        Query.equal("boardId", column.boardId),
      ]);

      if (docs.documents.length > 0) {
        // Update existing document
        await databases.updateDocument(
          databaseId,
          collectionId,
          docs.documents[0]["$id"],
          {
            encryptedData: JSON.stringify(encryptedData),
            userId,
            boardId: column.boardId,
            columnId: column.id,
            title: column.title,
            order: column.order,
            lastUpdated: new Date().toISOString(),
          }
        );
      } else {
        // Create new document
        await databases.createDocument(databaseId, collectionId, ID.unique(), {
          encryptedData: JSON.stringify(encryptedData),
          userId,
          boardId: column.boardId,
          columnId: column.id,
          title: column.title,
          order: column.order,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      // If error in checking, try to create document
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        encryptedData: JSON.stringify(encryptedData),
        userId,
        boardId: column.boardId,
        columnId: column.id,
        title: column.title,
        order: column.order,
        lastUpdated: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving column to cloud:", error);
    return false;
  }
}

export async function getColumnsFromCloud(
  boardId: string,
  encryptionKey: string
): Promise<KanbanColumn[]> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_COLUMNS_COLLECTION_ID || "";

    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("boardId", boardId),
    ]);

    const columns: KanbanColumn[] = [];
    for (const doc of response.documents) {
      try {
        const encryptedData = JSON.parse(doc.encryptedData);
        const decryptedColumn = (await decryptData(
          encryptedData,
          encryptionKey
        )) as KanbanColumn;
        columns.push(decryptedColumn);
      } catch (error) {
        console.error(`Failed to decrypt column ${doc.columnId}:`, error);
      }
    }

    // Sort columns by order
    return columns.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting columns from cloud:", error);
    return [];
  }
}

export async function deleteColumnFromCloud(
  columnId: string,
  boardId: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_COLUMNS_COLLECTION_ID || "";

    const docs = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("columnId", columnId),
      Query.equal("boardId", boardId),
    ]);

    if (docs.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        collectionId,
        docs.documents[0]["$id"]
      );
    }

    // Also delete all cards in this column
    await deleteAllCardsForColumnFromCloud(columnId);

    return true;
  } catch (error) {
    console.error("Error deleting column from cloud:", error);
    return false;
  }
}

async function deleteAllColumnsForBoardFromCloud(
  userId: string,
  boardId: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_COLUMNS_COLLECTION_ID || "";

    const docs = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("boardId", boardId),
    ]);

    // Delete each column
    for (const doc of docs.documents) {
      await databases.deleteDocument(databaseId, collectionId, doc.$id);
      // Delete all cards in the column
      await deleteAllCardsForColumnFromCloud(doc.columnId);
    }

    return true;
  } catch (error) {
    console.error("Error deleting columns for board from cloud:", error);
    return false;
  }
}

// CARD OPERATIONS
export async function saveCardToCloud(
  userId: string,
  card: KanbanCard,
  encryptionKey: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const encryptedData = await encryptData(card, encryptionKey);

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_CARDS_COLLECTION_ID || "";

    try {
      const docs = await databases.listDocuments(databaseId, collectionId, [
        Query.equal("cardId", card.id),
      ]);

      if (docs.documents.length > 0) {
        // Update existing document
        await databases.updateDocument(
          databaseId,
          collectionId,
          docs.documents[0]["$id"],
          {
            encryptedData: JSON.stringify(encryptedData),
            userId,
            columnId: card.columnId,
            cardId: card.id,
            title: card.title,
            order: card.order,
            lastUpdated: new Date().toISOString(),
          }
        );
      } else {
        // Create new document
        await databases.createDocument(databaseId, collectionId, ID.unique(), {
          encryptedData: JSON.stringify(encryptedData),
          userId,
          columnId: card.columnId,
          cardId: card.id,
          title: card.title,
          order: card.order,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      // If error in checking, try to create document
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        encryptedData: JSON.stringify(encryptedData),
        userId,
        columnId: card.columnId,
        cardId: card.id,
        title: card.title,
        order: card.order,
        lastUpdated: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving card to cloud:", error);
    return false;
  }
}

export async function getCardsForColumnFromCloud(
  columnId: string,
  encryptionKey: string
): Promise<KanbanCard[]> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_CARDS_COLLECTION_ID || "";

    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("columnId", columnId),
    ]);

    const cards: KanbanCard[] = [];
    for (const doc of response.documents) {
      try {
        const encryptedData = JSON.parse(doc.encryptedData);
        const decryptedCard = (await decryptData(
          encryptedData,
          encryptionKey
        )) as KanbanCard;
        cards.push(decryptedCard);
      } catch (error) {
        console.error(`Failed to decrypt card ${doc.cardId}:`, error);
      }
    }

    // Sort cards by order
    return cards.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting cards from cloud:", error);
    return [];
  }
}

export async function deleteCardFromCloud(cardId: string): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_CARDS_COLLECTION_ID || "";

    const docs = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("cardId", cardId),
    ]);

    if (docs.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        collectionId,
        docs.documents[0]["$id"]
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting card from cloud:", error);
    return false;
  }
}

async function deleteAllCardsForColumnFromCloud(
  columnId: string
): Promise<boolean> {
  try {
    const { databases } = await getAppwriteClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_KANBAN_CARDS_COLLECTION_ID || "";

    const docs = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("columnId", columnId),
    ]);

    // Delete each card
    for (const doc of docs.documents) {
      await databases.deleteDocument(databaseId, collectionId, doc.$id);
    }

    return true;
  } catch (error) {
    console.error("Error deleting cards for column from cloud:", error);
    return false;
  }
}
