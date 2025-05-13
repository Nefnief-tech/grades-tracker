import { AppwriteException } from 'appwrite';
import { getCurrentUser } from './appwrite';
import appwriteMFA from './appwrite-mfa';

/**
 * Checks if the current session requires MFA verification and returns appropriate info
 */
export async function checkMfaRequired(): Promise<{ 
  requiresMFA: boolean; 
  challengeId?: string; 
  email?: string;
}> {
  try {
    // Try to get the current user
    await getCurrentUser();
    // If we get here, MFA is not required
    return { requiresMFA: false };
  } catch (error) {
    // Type guard for AppwriteException
    const isAppwriteError = error instanceof AppwriteException;
    
    // Check if this is specifically an MFA error
    const isMfaError = isAppwriteError && 
      ((error as AppwriteException).message?.includes('More factors are required') || 
       (error as AppwriteException).code === 412);
    
    if (isMfaError) {
      console.log('MFA verification required, detected from error');
      
      // We have a session but it needs MFA verification
      try {
        // Try to list factors to verify we're in MFA mode
        const factors = await appwriteMFA.listFactors();
        const hasMfaFactors = !!(factors.totp || factors.phone || factors.email);
        
        if (hasMfaFactors) {
          console.log('MFA factors found:', factors);
          
          try {
            // Try to create a new challenge
            const challenge = await appwriteMFA.createEmailChallenge();
            console.log('Created new MFA challenge:', challenge);
            
            return {
              requiresMFA: true,
              challengeId: challenge.$id
            };
          } catch (challengeError) {
            console.log('Error creating challenge (may already exist):', challengeError);
            
            // Challenge might already exist or there might be another issue
            return { requiresMFA: true };
          }
        }
      } catch (factorError) {
        console.error('Error checking MFA factors:', factorError);
      }
      
      return { requiresMFA: true };
    }
    
    // Not an MFA error
    return { requiresMFA: false };
  }
}

/**
 * Redirects to the MFA verification page if needed
 * Returns true if redirection happened
 */
export async function redirectToMfaIfNeeded(
  email: string | null = null,
  ignorePaths: string[] = ['/verify-mfa', '/login']
): Promise<boolean> {
  // Skip checks on certain paths
  if (typeof window === 'undefined') {
    return false;
  }
  
  const pathname = window.location.pathname;
  if (ignorePaths.some(path => pathname.startsWith(path))) {
    return false;
  }
  
  // Check MFA status
  const { requiresMFA, challengeId } = await checkMfaRequired();
  
  if (requiresMFA) {
    console.log('MFA required but not completed, redirecting to verification page');
    
    // Build the redirect URL
    let redirectUrl = `/verify-mfa`;
    const params = new URLSearchParams();
    
    if (email) {
      params.append('email', email);
    }
    
    if (challengeId) {
      params.append('challengeId', challengeId);
    }
    
    // Add current path as returnTo parameter to come back after verification
    params.append('returnTo', pathname + window.location.search);
    
    redirectUrl += `?${params.toString()}`;
    
    // Force a hard redirect
    window.location.href = redirectUrl;
    return true;
  }
  
  return false;
}

/**
 * Middleware-style function to ensure MFA is complete or redirect
 */
export function withMfaProtection(callback: Function, email: string | null = null): Promise<any> {
  return redirectToMfaIfNeeded(email).then(wasRedirected => {
    if (!wasRedirected) {
      return callback();
    }
    return null; // Return null if we redirected
  });
}