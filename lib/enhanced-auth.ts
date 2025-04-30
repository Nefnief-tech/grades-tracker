import { login as appwriteLogin, getCurrentUser } from '@/lib/appwrite';
import type { User } from '@/contexts/AuthContext';
import { Email2FAService } from '@/lib/email-2fa';

/**
 * Enhanced login function that supports 2FA
 */
export async function enhancedLogin(
  email: string,
  password: string,
  setUser: (user: User | null) => void,
  setIsAdmin: (isAdmin: boolean) => void,
  manageCookie: (isAdmin: boolean | undefined) => void
): Promise<void> {
  // First step: authenticate with Appwrite
  await appwriteLogin(email, password);
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Authentication failed');
  }
  
  // Check if verification is already complete (returning from 2FA page)
  const isVerificationComplete = sessionStorage.getItem('verificationComplete') === 'true';
  if (isVerificationComplete) {
    // Clear verification flag
    sessionStorage.removeItem('verificationComplete');
    
    // Complete login
    setUser(currentUser);
    setIsAdmin(!!currentUser.isAdmin);
    manageCookie(currentUser.isAdmin);
    return;
  }
  
  // Check if user has 2FA enabled
  const twoFactorService = new Email2FAService();
  const twoFactorEnabled = await twoFactorService.is2FAEnabled(currentUser.id);
  
  // If 2FA is enabled, send verification code and redirect to verification page
  if (twoFactorEnabled) {
    // Generate verification code
    const code = await twoFactorService.generateAndStoreCode(currentUser.id);
    
    // Store user info for the verification page
    sessionStorage.setItem('pendingVerificationUserId', currentUser.id);
    sessionStorage.setItem('pendingVerificationEmail', currentUser.email);
    if (currentUser.name) {
      sessionStorage.setItem('pendingVerificationName', currentUser.name);
    }
    
    // Send verification email
    await twoFactorService.sendVerificationEmail(
      currentUser.email,
      currentUser.name || 'User',
      code
    );
    
    // Redirect to verification page
    window.location.href = '/verify-2fa';
    return;
  }
  
  // If 2FA is not enabled, complete login normally
  setUser(currentUser);
  setIsAdmin(!!currentUser?.isAdmin);
  manageCookie(currentUser?.isAdmin);
}