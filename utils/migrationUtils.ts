import { getAppwriteClient } from "@/lib/appwrite";
import { Query } from "appwrite";
import { encrypt, generateUserEncryptionKey } from "./encryptionUtils";

/**
 * Migrate existing test data to use encryption
 * This should be run once when encryption is added
 */
export async function migrateTestsToEncryption(userId: string): Promise<void> {
  try {
    const client = await getAppwriteClient();
    const { databases } = client;

    // Get all tests without encryption
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
      [Query.equal("userId", userId), Query.isNull("encryptedData")]
    );

    if (response.documents.length === 0) {
      console.log("No tests need migration for user:", userId);
      return;
    }

    console.log(
      `Migrating ${response.documents.length} tests to encryption for user: ${userId}`
    );

    // Generate encryption key
    const encryptionKey = await generateUserEncryptionKey(userId);

    // Process each document
    for (const doc of response.documents) {
      try {
        // Data to encrypt
        const sensitiveData = {
          title: doc.title,
          description: doc.description || "",
          subjectId: doc.subjectId,
          priority: doc.priority || "medium",
          reminderEnabled: doc.reminderEnabled || false,
          reminderDate: doc.reminderDate || "",
        };

        // Encrypt sensitive data
        const encryptedData = await encrypt(sensitiveData, encryptionKey);

        // Update the document with encrypted data
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID!,
          doc.$id,
          {
            encryptedData,
            updatedAt: new Date().toISOString(),
          }
        );

        console.log(`Migrated test ${doc.testId}`);
      } catch (err) {
        console.error(`Failed to migrate test ${doc.$id}:`, err);
      }
    }

    console.log("Migration completed");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
