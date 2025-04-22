import { Client, Databases, ID } from "appwrite";

// Database constants
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
  process.env.APPWRITE_DATABASE_ID ||
  "";
export const MAINTENANCE_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MAINTENANCE_COLLECTION_ID ||
  "maintenanceSettings";

// Check for required configuration
if (!DATABASE_ID) {
  console.error(
    "Missing required environment variable: APPWRITE_DATABASE_ID or NEXT_PUBLIC_APPWRITE_DATABASE_ID"
  );
}

// Server API key for authentication
const apiKey = process.env.APPWRITE_API_KEY || "";

// Initialize Appwrite server-side client
const client = new Client();

// Configure the client
client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      process.env.APPWRITE_ENDPOINT ||
      ""
  )
  .setProject(
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
      process.env.APPWRITE_PROJECT_ID ||
      ""
  );

// Add API key
if (apiKey) {
  // Different versions of Appwrite SDK have different methods
  if (typeof client.setKey === "function") {
    client.setKey(apiKey);
  } else if (typeof client.setAPIKey === "function") {
    (client as any).setAPIKey(apiKey);
  } else if (typeof client.setSecret === "function") {
    (client as any).setSecret(apiKey);
  } else {
    console.warn("Could not set Appwrite API key - method not found");
  }
}

export const databases = new Databases(client);
export const serverID = ID;
