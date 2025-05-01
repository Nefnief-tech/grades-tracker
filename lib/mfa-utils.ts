/**
 * Utility functions for working with MFA challenges across the application
 */

/**
 * Gets the current MFA challenge ID from all possible sources
 * This ensures maximum reliability in retrieving the challenge ID
 */
export function getMfaChallengeId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Check all possible sources in order of reliability
    
    // 1. Global variable (fastest, set by redirectToMfaVerification)
    if ((window as any).__MFA_CHALLENGE_ID__) {
      return (window as any).__MFA_CHALLENGE_ID__;
    }
    
    // 2. URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlChallengeId = params.get('challengeId');
    if (urlChallengeId) {
      return urlChallengeId;
    }
    
    // 3. Local storage (most common)
    const lsChallengeId = localStorage.getItem('mfa_challenge_id');
    if (lsChallengeId) {
      return lsChallengeId;
    }
    
    // 4. Session storage
    const ssChallengeId = sessionStorage.getItem('mfa_challenge_id');
    if (ssChallengeId) {
      return ssChallengeId;
    }
    
    // 5. Cookie
    const cookieChallengeId = getCookieValue('mfa_challenge_id');
    if (cookieChallengeId) {
      return cookieChallengeId;
    }
    
    // 6. Hidden DOM element
    const domElement = document.getElementById('mfa-data-container');
    if (domElement) {
      const domChallengeId = domElement.getAttribute('data-challenge-id');
      if (domChallengeId) {
        return domChallengeId;
      }
    }
    
    // 7. URL fragment
    const fragmentMatch = window.location.search.match(/__mfa=([^&]+)/);
    if (fragmentMatch && fragmentMatch[1]) {
      return decodeURIComponent(fragmentMatch[1]);
    }
  } catch (e) {
    console.error('[MFA Utils] Error getting challenge ID:', e);
  }
  
  // No challenge ID found
  return null;
}

/**
 * Gets the associated email for the current MFA challenge
 */
export function getMfaEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Similar to challenge ID, check all sources
    
    // 1. Global variable
    if ((window as any).__MFA_EMAIL__) {
      return (window as any).__MFA_EMAIL__;
    }
    
    // 2. URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    if (urlEmail) {
      return urlEmail;
    }
    
    // 3. Local storage
    const lsEmail = localStorage.getItem('mfa_email');
    if (lsEmail) {
      return lsEmail;
    }
    
    // 4. Session storage
    const ssEmail = sessionStorage.getItem('mfa_email');
    if (ssEmail) {
      return ssEmail;
    }
    
    // 5. Cookie
    const cookieEmail = getCookieValue('mfa_email');
    if (cookieEmail) {
      return cookieEmail;
    }
    
    // 6. Hidden DOM element
    const domElement = document.getElementById('mfa-data-container');
    if (domElement) {
      const domEmail = domElement.getAttribute('data-email');
      if (domEmail) {
        return domEmail;
      }
    }
  } catch (e) {
    console.error('[MFA Utils] Error getting email:', e);
  }
  
  // No email found
  return null;
}

/**
 * Helper function to get cookie value by name
 */
function getCookieValue(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  } catch (e) {
    console.error('[MFA Utils] Error reading cookie:', e);
    return null;
  }
}

/**
 * Saves MFA challenge data to all available storage mechanisms
 * This ensures maximum reliability in storing and retrieving the data
 */
export function saveMfaChallengeData(challengeId: string, email?: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // 1. Global variables
    (window as any).__MFA_CHALLENGE_ID__ = challengeId;
    if (email) {
      (window as any).__MFA_EMAIL__ = email;
    }
    
    // 2. Local storage
    localStorage.setItem('mfa_challenge_id', challengeId);
    if (email) {
      localStorage.setItem('mfa_email', email);
    }
    
    // 3. Session storage
    sessionStorage.setItem('mfa_challenge_id', challengeId);
    if (email) {
      sessionStorage.setItem('mfa_email', email);
    }
    
    // 4. Cookies
    document.cookie = `mfa_challenge_id=${challengeId}; path=/; max-age=3600; SameSite=Strict`;
    if (email) {
      document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
    }
    document.cookie = `mfa_required=true; path=/; max-age=3600; SameSite=Strict`;
    
    // 5. DOM storage
    let domElement = document.getElementById('mfa-data-container');
    if (!domElement) {
      domElement = document.createElement('div');
      domElement.id = 'mfa-data-container';
      domElement.style.display = 'none';
      document.body.appendChild(domElement);
    }
    
    domElement.setAttribute('data-challenge-id', challengeId);
    if (email) {
      domElement.setAttribute('data-email', email);
    }
    
    // 6. URL fragment (doesn't work if we're navigating away)
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('__mfa', challengeId);
      window.history.replaceState(null, '', currentUrl.toString());
    } catch (e) {
      console.error('[MFA Utils] Error updating URL:', e);
    }
    
    console.log('[MFA Utils] Challenge data saved to all storage mechanisms');
  } catch (e) {
    console.error('[MFA Utils] Error saving challenge data:', e);
  }
}