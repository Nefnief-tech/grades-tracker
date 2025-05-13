import { AppwriteException } from 'appwrite';
import appwriteMFA from './appwrite-mfa';

/**
 * Helper function to check if an error is an MFA challenge error
 */
export function isMfaRequiredError(error: any): boolean {
  if (!error) return false;
  
  // Check all possible indicators of MFA challenge requirement
  return (
    (error instanceof AppwriteException && error.type === 'user_mfa_challenge') ||
    (error instanceof AppwriteException && error.type === 'user_more_factors_required') ||
    (error.message && typeof error.message === 'string' && error.message.includes('More factors are required')) ||
    (error.type && typeof error.type === 'string' && error.type.includes('mfa'))
  );
}

/**
 * Handle MFA challenge during login process
 * Returns a challenge object with ID for verification
 */
export async function handleMfaChallenge(email: string): Promise<{ challengeId: string, email: string }> {
  try {
    // Create an email challenge
    const challenge = await appwriteMFA.createEmailChallenge();
    
    if (!challenge || !challenge.$id) {
      throw new Error('Failed to create MFA challenge');
    }
    
    console.log('MFA challenge created:', challenge.$id);
    
    return {
      challengeId: challenge.$id,
      email: email
    };
  } catch (error) {
    console.error('Error creating MFA challenge:', error);
    throw new Error('Failed to initiate two-factor authentication');
  }
}

/**
 * Verify MFA challenge code
 */
export async function verifyMfaChallenge(challengeId: string, code: string): Promise<boolean> {
  try {
    await appwriteMFA.verifyChallenge(challengeId, code);
    return true;
  } catch (error) {
    console.error('Error verifying MFA challenge:', error);
    return false;
  }
}