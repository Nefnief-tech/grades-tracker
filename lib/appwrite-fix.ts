'use client';

import { Client, Account, Databases, ID, Query, Storage } from "appwrite";

// Configuration for Appwrite
export const APPWRITE_CONFIG = {
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
    userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID || "",
    questionCollectionId: process.env.NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID || "",
    quizCollectionId: process.env.NEXT_PUBLIC_APPWRITE_QUIZ_COLLECTION_ID || "",
};

// Initialize the client with browser check
let client: Client;

// Only initialize on client side to prevent SSR errors
if (typeof window !== 'undefined') {
    client = new Client();
    client.setEndpoint(APPWRITE_CONFIG.endpoint);
    client.setProject(APPWRITE_CONFIG.projectId);
    console.log('[Appwrite] Client initialized on client-side');
} else {
    // Create an empty client for SSR that will be initialized on client
    client = new Client();
    console.log('[Appwrite] Empty client created for SSR');
}

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export types
export { Client, ID, Query };