/**
 * This file manages user sessions through the Appwrite account API
 */

// Import account from our appwrite setup
import { getAccount } from "./appwrite";

/**
 * Fetches all active sessions for the current user
 * @returns Array of active sessions
 */
export async function getActiveSessions() {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');
    
    const response = await account.listSessions();
    return response.sessions || [];
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
}

/**
 * Ends a specific session by ID
 * @param sessionId The ID of the session to end
 */
export async function endSession(sessionId: string) {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');
    
    await account.deleteSession(sessionId);
    return true;
  } catch (error) {
    console.error(`Error ending session ${sessionId}:`, error);
    return false;
  }
}

/**
 * Ends all sessions except the current one
 */
export async function endAllOtherSessions() {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');
    
    await account.deleteSessions();
    return true;
  } catch (error) {
    console.error("Error ending all other sessions:", error);
    return false;
  }
}

/**
 * Get details about the current session
 */
export async function getCurrentSession() {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');
    
    return await account.getSession('current');
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}