/**
 * API client for creating and verifying MFA challenges
 */

interface CreateChallengeResponse {
  success: boolean;
  challengeId?: string;
  email?: string;
  created?: string;
  expires?: string;
  verificationUrl?: string;
  error?: string;
}

interface VerifyChallengeResponse {
  success: boolean;
  verified?: boolean;
  userId?: string;
  user?: any;
  error?: string;
}

/**
 * Creates a new MFA challenge via API
 * This is more reliable than client-side challenge creation
 */
export async function createMfaChallenge(email?: string): Promise<CreateChallengeResponse> {
  try {
    if (email) {
      // Use POST with email parameter
      const response = await fetch('/api/auth/mfa/create-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      return data;
    } else {
      // Use GET without email
      const response = await fetch('/api/auth/mfa/create-challenge');
      const data = await response.json();
      return data;
    }
  } catch (error: any) {
    console.error('[MFA API Client] Error creating challenge:', error);
    return {
      success: false,
      error: error.message || 'Failed to create MFA challenge',
    };
  }
}

/**
 * Verifies an MFA challenge via API
 */
export async function verifyMfaChallenge(
  challengeId: string,
  code: string
): Promise<VerifyChallengeResponse> {
  try {
    const response = await fetch('/api/auth/mfa/verify-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengeId, code }),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[MFA API Client] Error verifying challenge:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify MFA challenge',
    };
  }
}

/**
 * Creates a challenge and returns all the necessary data
 * This function is designed for use in components
 */
export async function createMfaChallengeWithStorage(email?: string): Promise<CreateChallengeResponse> {
  try {
    const result = await createMfaChallenge(email);
    
    if (result.success && result.challengeId) {
      // Store challenge ID in multiple places
      if (typeof window !== 'undefined') {
        // Global variable
        (window as any).__MFA_CHALLENGE_ID__ = result.challengeId;
        
        // Local storage
        localStorage.setItem('mfa_challenge_id', result.challengeId);
        
        // Session storage
        sessionStorage.setItem('mfa_challenge_id', result.challengeId);
        
        // Cookie
        document.cookie = `mfa_challenge_id=${result.challengeId}; path=/; max-age=3600; SameSite=Strict`;
        
        // Store email if available
        if (email) {
          (window as any).__MFA_EMAIL__ = email;
          localStorage.setItem('mfa_email', email);
          sessionStorage.setItem('mfa_email', email);
          document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
        }
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('[MFA API Client] Error in create challenge with storage:', error);
    return {
      success: false,
      error: error.message || 'Failed to create and store MFA challenge',
    };
  }
}