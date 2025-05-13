import { Test } from "@/types/grades";
import { Client, Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite";
import {
  encrypt,
  decrypt,
  generateUserEncryptionKey,
} from "@/utils/encryptionUtils";

// Use the hardcoded collection ID as fallback if environment variable fails
const TESTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID ||
  "67e2f62c000e8723bd8d";
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "67d6b079002144822b5e";

/**
 * Save a test to the Appwrite database with encryption
 */
export const saveTest = async (
  test: Omit<Test, "id">,
  userId: string
): Promise<Test> => {
  try {
    console.log("[Test] Saving test:", test.title);
    const client = await getAppwriteClient();
    const { databases } = client;

    const testId = ID.unique();

    // Format data to match collection schema - DON'T include encryptedData field
    const documentData = {
      userId,
      testId,
      // Store all fields as-is to match the expected schema
      title: test.title,
      description: test.description || "",
      date: test.date,
      subjectId: test.subjectId,
      completed: test.completed || false,
      priority: test.priority || "medium",
      reminderEnabled: test.reminderEnabled || false,
      reminderDate: test.reminderDate || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(
      `[Test] Using database ID: ${DATABASE_ID}, collection ID: ${TESTS_COLLECTION_ID}`
    );

    // Create the document in Appwrite
    await databases.createDocument(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      testId,
      documentData
    );

    // Return the created test with the generated ID
    return {
      id: testId,
      ...test,
    };
  } catch (error) {
    console.error("[Test] Error saving test:", error);
    throw error;
  }
};

/**
 * Update a test in the Appwrite database
 */
export const updateTest = async (
  id: string,
  test: Partial<Omit<Test, "id">>,
  userId: string
): Promise<Test> => {
  try {
    console.log("[Test] Updating test:", id);
    const client = await getAppwriteClient();
    const { databases } = client;

    // First, get the current document
    const currentDoc = await databases.getDocument(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      id
    );

    // Prepare update document with only the fields that are being updated
    const documentData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Add fields if they're being updated
    if (test.title !== undefined) documentData.title = test.title;
    if (test.description !== undefined)
      documentData.description = test.description;
    if (test.date !== undefined) documentData.date = test.date;
    if (test.subjectId !== undefined) documentData.subjectId = test.subjectId;
    if (test.completed !== undefined) documentData.completed = test.completed;
    if (test.priority !== undefined) documentData.priority = test.priority;
    if (test.reminderEnabled !== undefined)
      documentData.reminderEnabled = test.reminderEnabled;
    if (test.reminderDate !== undefined)
      documentData.reminderDate = test.reminderDate;

    // Update the document in Appwrite
    await databases.updateDocument(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      id,
      documentData
    );

    // Combine current doc data with updates for return
    return {
      id,
      title: test.title !== undefined ? test.title : currentDoc.title,
      description:
        test.description !== undefined
          ? test.description
          : currentDoc.description,
      date: test.date !== undefined ? test.date : currentDoc.date,
      subjectId:
        test.subjectId !== undefined ? test.subjectId : currentDoc.subjectId,
      completed:
        test.completed !== undefined ? test.completed : currentDoc.completed,
      priority:
        test.priority !== undefined ? test.priority : currentDoc.priority,
      reminderEnabled:
        test.reminderEnabled !== undefined
          ? test.reminderEnabled
          : currentDoc.reminderEnabled,
      reminderDate:
        test.reminderDate !== undefined
          ? test.reminderDate
          : currentDoc.reminderDate,
    };
  } catch (error) {
    console.error("[Test] Error updating test:", error);
    throw error;
  }
};

/**
 * Delete a test from the Appwrite database
 */
export const deleteTest = async (id: string): Promise<void> => {
  try {
    console.log("[Test] Deleting test:", id);
    const client = await getAppwriteClient();
    const { databases } = client;

    await databases.deleteDocument(DATABASE_ID, TESTS_COLLECTION_ID, id);
  } catch (error) {
    console.error("[Test] Error deleting test:", error);
    throw error;
  }
};

/**
 * Get all tests for a user from the Appwrite database
 */
export const getTestsByUserId = async (userId: string): Promise<Test[]> => {
  try {
    console.log("[Test] Getting tests for user:", userId);
    const client = await getAppwriteClient();
    const { databases } = client;

    // Using the imported Query directly
    const response = await databases.listDocuments(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    console.log(
      `[Test] Found ${response.documents.length} tests for user ${userId}`
    );

    // Log the first document for debugging if available
    if (response.documents.length > 0) {
      console.log(
        "[Test] First test document format:",
        JSON.stringify(response.documents[0])
      );
    }

    // Map documents to Test objects
    const tests = response.documents.map((doc) => ({
      id: doc.testId || doc.$id,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      subjectId: doc.subjectId,
      completed: doc.completed || false,
      priority: doc.priority || "medium",
      reminderEnabled: doc.reminderEnabled || false,
      reminderDate: doc.reminderDate || "",
    }));

    return tests;
  } catch (error) {
    console.error("[Test] Error getting tests:", error);
    throw error;
  }
};

/**
 * Get tests for a specific subject
 */
export const getTestsBySubject = async (
  userId: string,
  subjectId: string
): Promise<Test[]> => {
  try {
    console.log(`[Test] Getting tests for subject: ${subjectId}`);
    const client = await getAppwriteClient();
    const { databases } = client;

    // Query directly by userId and subjectId
    const response = await databases.listDocuments(
      DATABASE_ID,
      TESTS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("subjectId", subjectId)]
    );

    console.log(
      `[Test] Found ${response.documents.length} tests for subject ${subjectId}`
    );

    // Map documents to Test objects
    const tests = response.documents.map((doc) => ({
      id: doc.testId || doc.$id,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      subjectId: doc.subjectId,
      completed: doc.completed || false,
      priority: doc.priority || "medium",
      reminderEnabled: doc.reminderEnabled || false,
      reminderDate: doc.reminderDate || "",
    }));

    return tests;
  } catch (error) {
    console.error("[Test] Error getting tests for subject:", error);
    throw error;
  }
};

/**
 * Mark a test as completed
 */
export const markTestCompleted = async (
  id: string,
  completed: boolean
): Promise<void> => {
  try {
    console.log(
      `[Test] Marking test ${id} as ${completed ? "completed" : "incomplete"}`
    );
    const client = await getAppwriteClient();
    const { databases } = client;

    await databases.updateDocument(DATABASE_ID, TESTS_COLLECTION_ID, id, {
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Test] Error marking test as completed:", error);
    throw error;
  }
};
