
/**
 * This file manages user sessions through the Appwrite account API
 */

import { getAccount } from "./appwrite";

// Simple user agent parser for browser/OS detection
const parseUserAgent = (userAgent: string) => {
  const browser = userAgent.match(/(chrome|safari|firefox|msie|trident|edge)/i);
  const os = userAgent.match(/(mac|win|linux|android|iphone|ipad)/i);

  return {
    browser: browser ? browser[0].charAt(0).toUpperCase() + browser[0].slice(1) : 'Unknown',
    os: os ? os[0].charAt(0).toUpperCase() + os[0].slice(1) : 'Unknown'
  };
};

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrentSession: boolean;
  lastAccessedAt: string;
}

// Store current session ID
let currentSessionId: string | null = null;

/**
 * Format session information from Appwrite response
 */
const formatSessionInfo = (session: any, isCurrentSession: boolean): Session => {
  const parsedUA = parseUserAgent(session.userAgent || '');
  const deviceName = `${parsedUA.browser} on ${parsedUA.os}`;

  const lastActiveDate = new Date(session.providerAccessTokenExpiry * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastActiveDate.getTime()) / 1000);

  let lastActive;
  if (diffInSeconds < 60) {
    lastActive = 'Just now';
  } else if (diffInSeconds < 3600) {
    lastActive = `${Math.floor(diffInSeconds / 60)} minutes ago`;
  } else if (diffInSeconds < 86400) {
    lastActive = `${Math.floor(diffInSeconds / 3600)} hours ago`;
  } else if (diffInSeconds < 604800) {
    lastActive = `${Math.floor(diffInSeconds / 86400)} days ago`;
  } else {
    lastActive = `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  }

  const countryName = session.countryName || 'Unknown';
  const ipAddress = session.ip ? session.ip : 'Unknown';
  const location = countryName ? `${ipAddress}, ${countryName}` : ipAddress;

  return {
    id: session.$id,
    device: deviceName,
    location: location,
    ip: session.ip || 'Unknown',
    lastActive,
    isCurrentSession,
    lastAccessedAt: new Date(session.providerAccessTokenExpiry * 1000).toISOString()
  };
};

/**
 * Fetches all active sessions for the current user
 * @returns Array of active sessions
 */
export async function getActiveSessions(): Promise<Session[]> {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');

    const currentSession = await account.getSession('current');
    currentSessionId = currentSession.$id;

    const response = await account.listSessions();

    if (!response.sessions) {
      throw new Error('No sessions returned from Appwrite');
    }

    return response.sessions.map(session =>
      formatSessionInfo(session, session.$id === currentSessionId)
    );
  } catch (error) {
    console.error('Error fetching sessions from Appwrite:', error);
    throw error;
  }
}

/**
 * Ends a specific session by ID
 * @param sessionId The ID of the session to end
 */
export async function endSession(sessionId: string): Promise<boolean> {
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
export async function endAllOtherSessions(): Promise<boolean> {
  try {
    const account = getAccount();
    if (!account) throw new Error('Appwrite account is not initialized');

    if (!currentSessionId) {
      const currentSession = await account.getSession('current');
      currentSessionId = currentSession.$id;
    }

    const { sessions } = await account.listSessions();

    const deletePromises = sessions
      .filter(session => session.$id !== currentSessionId)
      .map(session => account.deleteSession(session.$id));

    await Promise.all(deletePromises);

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