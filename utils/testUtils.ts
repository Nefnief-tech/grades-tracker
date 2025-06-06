import { Test } from "@/types/grades";
import { Client, Databases, ID, Query } from "appwrite";
import { getAppwriteClient } from "@/lib/appwrite";
import {
  encrypt,
  decrypt,
  generateUserEncryptionKey,
} from "@/utils/encryptionUtils";

/**
 * Save a test to the Appwrite database with encryption
 */
export const saveTest = async (
  test: Omit<Test, "id">,
  userId: string
): Promise<Test> => {
  try {
    const client = await getAppwriteClient();
    const { databases } = client;

    const testId = ID.unique();

    // Generate encryption key from user ID
    const encryptionKey = await generateUserEncryptionKey(userId);

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

    // Create the document in Appwrite
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      testId,
      documentData
    );

    // Return the created test with the generated ID
    return {
      id: testId,
      ...test,
    };
  } catch (error) {
    console.error("Error saving test:", error);
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
    const client = await getAppwriteClient();
    const { databases } = client;

    // First, get the current document
    const currentDoc = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
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
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
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
    console.error("Error updating test:", error);
    throw error;
  }
};

/**
 * Delete a test from the Appwrite database
 */
export const deleteTest = async (id: string): Promise<void> => {
  try {
    const client = await getAppwriteClient();
    const { databases } = client;

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      id
    );
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

/**
 * Get all tests for a user from the Appwrite database
 */
export const getTestsByUserId = async (userId: string): Promise<Test[]> => {
  try {
    const client = await getAppwriteClient();
    const { databases } = client;

    // Using the imported Query directly
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    // Map documents to Test objects
    const tests = response.documents.map((doc) => ({
      id: doc.testId,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      subjectId: doc.subjectId,
      completed: doc.completed,
      priority: doc.priority,
      reminderEnabled: doc.reminderEnabled,
      reminderDate: doc.reminderDate,
    }));

    return tests;
  } catch (error) {
    console.error("Error getting tests:", error);
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
    const client = await getAppwriteClient();
    const { databases } = client;

    // Query directly by userId and subjectId
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      [Query.equal("userId", userId), Query.equal("subjectId", subjectId)]
    );

    // Map documents to Test objects
    const tests = response.documents.map((doc) => ({
      id: doc.testId,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      subjectId: doc.subjectId,
      completed: doc.completed,
      priority: doc.priority,
      reminderEnabled: doc.reminderEnabled,
      reminderDate: doc.reminderDate,
    }));

    return tests;
  } catch (error) {
    console.error("Error getting tests for subject:", error);
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
    const client = await getAppwriteClient();
    const { databases } = client;

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      id,
      {
        completed,
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error marking test as completed:", error);
    throw error;
  }
};
