import { login as appwriteLogin, getCurrentUser, getAccount, databases } from '@/lib/appwrite';
import appwriteMFA from '@/lib/appwrite-mfa';
import { AppwriteException } from 'appwrite';

// Define the database ID directly in this file to avoid import errors
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default';

interface MfaLoginResult {
  success: boolean;
  user?: any;
  requiresMFA?: boolean;
  mfaChallenge?: {
    challengeId: string;
    email: string;
  };
  error?: string;
}

interface MfaVerifyResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Handles the MFA detection and challenge creation
 */
export async function handleMfaLogin(email: string, password: string): Promise<MfaLoginResult> {
  console.log('****************************************');
  console.log('*** MFA HANDLER - STARTED LOGIN PROCESS');
  console.log('****************************************');
  console.log('[MFA Handler] Starting login process for:', email);
  
  try {
    // First attempt to login (this will establish a session)
    console.log('[MFA Handler] Attempting login with credentials');
    await appwriteLogin(email, password);
    
    try {
      // Try to get user - if successful, we need to check if MFA is required for this user
      const user = await getCurrentUser();
      console.log('[MFA Handler] Successfully got user info', user);
      
      // Handle null user case more explicitly
      if (!user) {
        console.error('[MFA Handler] User object is null after login');
        
        // For null user, we still require MFA in all cases
        try {
          console.log('[MFA Handler] Creating MFA challenge for null user');
          const challenge = await appwriteMFA.createEmailChallenge();
          console.log('[MFA Handler] *** CHALLENGE ID: ' + challenge.$id);
          console.log('[MFA Handler] *** VERIFICATION URL: http://localhost:3000/verify-mfa?email=' + encodeURIComponent(email) + '&challengeId=' + challenge.$id);
          
          // Perform an immediate redirect to the verification page
          if (typeof window !== 'undefined') {
            redirectToMfaVerification(email, challenge.$id);
          }
          
          return {
            success: false,
            requiresMFA: true,
            mfaChallenge: {
              challengeId: challenge.$id,
              email
            }
          };
        } catch (staticError) {
          console.error('[MFA Handler] Error creating MFA challenge for null user:', staticError);
          
          // If we can't create a challenge, just return error
          return { 
            success: false, 
            error: 'Failed to create MFA challenge for null user' 
          };
        }
      }
      
      if (!user?.id) {
        console.error('[MFA Handler] User object is missing id property');
        console.error('[MFA Handler] User object:', user);
        
        // Always force MFA even with missing user ID
        try {
          console.log('[MFA Handler] Creating MFA challenge despite missing user ID');
          const challenge = await appwriteMFA.createEmailChallenge();
          return {
            success: false,
            requiresMFA: true,
            mfaChallenge: {
              challengeId: challenge.$id,
              email
            }
          };
        } catch (noIdError) {
          console.error('[MFA Handler] Error creating MFA challenge with missing ID:', noIdError);
          // If challenge creation fails, return user but mark as success
          return { success: true, user };
        }
      }
      
      console.log('[MFA Handler] USER ID VALUE:', user.id);
      console.log('[MFA Handler] USER OBJECT KEYS:', Object.keys(user));
      console.log('[MFA Handler] User object details:', JSON.stringify(user, null, 2));
      
      // ALWAYS FORCE MFA for all users regardless of preferences
      console.log('[MFA Handler] Always requiring MFA for all users');      
      try {
        const challenge = await appwriteMFA.createEmailChallenge();
        console.log('[MFA Handler] MFA challenge created (always required):', challenge);
        console.log('[MFA Handler] *** CHALLENGE ID: ' + challenge.$id);
        console.log('[MFA Handler] *** VERIFICATION URL: http://localhost:3000/verify-mfa?email=' + encodeURIComponent(email) + '&challengeId=' + challenge.$id);
        
        // Perform an immediate redirect to the verification page
        // This will ensure the challenge ID is passed correctly
        if (typeof window !== 'undefined') {
          redirectToMfaVerification(email, challenge.$id);
        }
        
        return {
          success: false,
          requiresMFA: true,
          mfaChallenge: {
            challengeId: challenge.$id,
            email
          }
        };
      } catch (challengeError) {
        console.error('[MFA Handler] Error creating MFA challenge:', challengeError);
        
        return {
          success: false,
          requiresMFA: true,
          error: 'Failed to create MFA challenge'
        };
      }
    } catch (userError: any) {
      console.log('[MFA Handler] Error getting user after login:', userError);
      
      // Check if this is due to MFA requirements
      const errorMsg = userError?.message || '';
      const isMfaRequired = 
        errorMsg.includes('More factors are required') || 
        errorMsg.includes('MFA') ||
        errorMsg.includes('verification') ||
        userError?.type === 'user_mfa_challenge' ||
        userError?.code === 412;
      
      if (isMfaRequired) {
        console.log('[MFA Handler] MFA is required based on error, creating challenge');
        try {
          // Create an email verification challenge
          const challenge = await appwriteMFA.createEmailChallenge();
          console.log('[MFA Handler] Challenge created:', challenge);
          
          // Return challenge info for the UI
          return {
            success: false,
            requiresMFA: true,
            mfaChallenge: {
              challengeId: challenge.$id,
              email
            }
          };
        } catch (challengeError: any) {
          console.error('[MFA Handler] Error creating MFA challenge:', challengeError);
          return {
            success: false,
            requiresMFA: true,
            error: challengeError.message || 'Failed to create MFA challenge'
          };
        }
      }
      
      // Not MFA related error
      return {
        success: false,
        error: userError.message || 'Authentication failed'
      };
    }
  } catch (error: any) {
    console.error('[MFA Handler] Login error:', error);
    
    // Format the error for display
    let errorMessage = 'Login failed';
    
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        errorMessage = 'Invalid email or password';
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verifies an MFA challenge
 */
export async function verifyMfaChallenge(challengeId: string, code: string): Promise<MfaVerifyResult> {
  try {
    console.log('[MFA Handler] Verifying challenge:', challengeId);
    console.log('[MFA Handler] Code entered:', code);
    
    // Additional validation and logging
    if (!challengeId) {
      console.error('[MFA Handler] Challenge ID is empty or undefined');
      return { success: false, error: 'Challenge ID is missing' };
    }
    
    if (!code || code.length < 6) {
      console.error('[MFA Handler] Invalid code format');
      return { success: false, error: 'Invalid verification code format' };
    }
    
    // Clean up inputs - remove any spaces or non-digits from code
    const cleanCode = code.replace(/\D/g, '');
    console.log('[MFA Handler] Using clean code for verification');
    
    // Try verification with clean inputs
    await appwriteMFA.verifyChallenge(challengeId, cleanCode);
    
    // If verification succeeded, get user
    console.log('[MFA Handler] Challenge verified successfully');
    try {
      const user = await getCurrentUser();
      return { 
        success: true,
        user
      };
    } catch (userError) {
      console.warn('[MFA Handler] Challenge verified but error getting user:', userError);
      // Even if we can't get the user, verification was successful
      return { success: true };
    }
  } catch (error: any) {
    console.error('[MFA Handler] Verification error:', error);
    
    let errorMessage = 'Verification failed';
    
    if (error instanceof AppwriteException) {
      errorMessage = error.message;
      console.log('[MFA Handler] Appwrite error code:', error.code);
      console.log('[MFA Handler] Appwrite error type:', error.type);
      
      // Special handling for specific error types
      if (error.code === 401) {
        errorMessage = 'Incorrect verification code';
      } else if (error.message.includes('Invalid token')) {
        errorMessage = 'Invalid verification code or challenge ID';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Simple helper to check if the user has MFA enabled
 */
export async function isMfaEnabled(): Promise<boolean> {
  try {
    // First check if user has an active session
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return false;
    }
    
    // Always return true to enforce MFA for all users
    console.log('[MFA Handler] MFA is always enabled for all users');
    return true;
  } catch (error) {
    console.error('[MFA Handler] Error checking MFA status:', error);
    return false;
  }
}

/**
 * Helper function to perform a hard redirect to the MFA verification page
 * This can be called from anywhere if redirection isn't happening automatically
 */
export function redirectToMfaVerification(email: string, challengeId: string): void {
  // Validate input parameters
  if (!challengeId) {
    console.error('[MFA Handler] ERROR: No challenge ID provided to redirectToMfaVerification');
    return;
  }

  console.log('[MFA Handler] FORCE REDIRECTING to verification page');
  console.log('[MFA Handler] Challenge ID:', challengeId);
  console.log('[MFA Handler] Email:', email);
  
  // Create a unique global variable to store the challenge ID
  // This helps other components capture it even if storage fails
  if (typeof window !== 'undefined') {
    (window as any).__MFA_CHALLENGE_ID__ = challengeId;
    (window as any).__MFA_EMAIL__ = email;
  }

  // Make it impossible to miss the challenge ID in logs
  console.log('**********************************************************');
  console.log('*************** MFA VERIFICATION REQUIRED ****************');
  console.log('**********************************************************');
  console.log('[MFA Handler] *** CHALLENGE ID: ' + challengeId);
  console.log('[MFA Handler] *** EMAIL: ' + email);
  console.log('[MFA Handler] *** VERIFICATION URL: /verify-mfa?challengeId=' + challengeId + '&email=' + encodeURIComponent(email));
  console.log('**********************************************************');

  // Build the complete URL with query parameters - IMPORTANT: don't encode email twice
  const verifyUrl = `/verify-mfa?challengeId=${challengeId}`;
  const urlWithEmail = `/verify-mfa?challengeId=${challengeId}&email=${email}`;
  
  // Log for debugging
  console.log('[MFA Handler] VERIFY URL WITH CHALLENGE ID:', verifyUrl);
  console.log('[MFA Handler] ABSOLUTE URL:', window.location.origin + urlWithEmail);
  
  // Alert the user in case console isn't visible
  if (typeof window !== 'undefined') {
    try {
      // Store data everywhere possible for redundancy
      // 1. Local storage (more persistent)
      localStorage.setItem('mfa_challenge_id', challengeId);
      localStorage.setItem('mfa_email', email);
      
      // 2. Session storage
      sessionStorage.setItem('mfa_challenge_id', challengeId);
      sessionStorage.setItem('mfa_email', email);
      
      // 3. Cookies with longer expiration
      document.cookie = `mfa_required=true; path=/; max-age=3600; SameSite=Strict`;
      document.cookie = `mfa_challenge_id=${challengeId}; path=/; max-age=3600; SameSite=Strict`;
      document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
      
      // 4. Create hidden elements in the DOM as another backup
      const hiddenDiv = document.createElement('div');
      hiddenDiv.id = 'mfa-data-container';
      hiddenDiv.style.display = 'none';
      hiddenDiv.setAttribute('data-challenge-id', challengeId);
      hiddenDiv.setAttribute('data-email', email);
      document.body.appendChild(hiddenDiv);
      
      // 5. Append data to URL fragment
      history.replaceState(null, '', window.location.pathname + window.location.search + 
                          (window.location.search ? '&' : '?') + 
                          `__mfa=${encodeURIComponent(challengeId)}`);
      
      // Display in console for easy access
      console.log('[MFA Handler] *** VERIFICATION CODE ***');
      console.log('[MFA Handler] CHALLENGE ID: ' + challengeId);
      console.log('[MFA Handler] ************************');
      
    // CRITICAL: Ensure our URL has the challenge ID properly encoded
      const safeUrl = `/verify-mfa?challengeId=${encodeURIComponent(challengeId)}&email=${encodeURIComponent(email)}`;
      console.log('[MFA Handler] SAFE REDIRECT URL:', safeUrl);
      
      // Use direct hard navigation with location.replace - most reliable 
      window.location.replace(safeUrl);
      
      // Fallback in case the above fails
      setTimeout(() => {
        if (!window.location.pathname.includes('verify-mfa')) {
          console.log('[MFA Handler] Primary redirect failed, using fallback navigation');
          window.location.href = safeUrl;
          
          // Also try with absolute URL
          const absoluteUrl = `${window.location.origin}/verify-mfa?challengeId=${encodeURIComponent(challengeId)}&email=${encodeURIComponent(email)}`;
          setTimeout(() => window.location.href = absoluteUrl, 300);
        }
      }, 800);
      
      // Final fallback with window.open
      setTimeout(() => {
        if (!window.location.pathname.includes('verify-mfa')) {
          console.log('[MFA Handler] All redirects failed, trying window.open');
          window.open(urlWithEmail, '_self');
        }
      }, 2000);
    } catch (e) {
      console.error('[MFA Handler] Error during redirect:', e);
      
      // If all else fails, show explicit instructions
      alert(`MFA verification required.\n\nChallenge ID: ${challengeId}\n\nPlease manually navigate to: ${window.location.origin}/verify-mfa?challengeId=${challengeId}`);
    }
  }
}