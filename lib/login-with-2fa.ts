import { User } from '@/contexts/AuthContext';
import { 
  login as appwriteLogin,
  getCurrentUser
} from '@/lib/appwrite';
import { UserPreferencesService } from '@/lib/user-preferences';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import { EmailService } from '@/lib/email-service';

/**
 * Login function with 2FA support
 */
export async function loginWith2FA(
  email: string,
  password: string,
  onSetUser: (user: User | null) => void,
  onSetAdmin: (isAdmin: boolean) => void,
  onManageCookie: (isAdmin: boolean | undefined) => void
): Promise<void> {
  try {
    // First step: authenticate with Appwrite
    await appwriteLogin(email, password);
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("Authentication failed");
    }
    
    // Check if verification is already complete (returning from 2FA page)
    const isVerificationComplete = sessionStorage.getItem('verificationComplete') === 'true';
    if (isVerificationComplete) {
      // Clear verification flag
      sessionStorage.removeItem('verificationComplete');
      
      // Complete login
      onSetUser(currentUser);
      onSetAdmin(!!currentUser.isAdmin);
      onManageCookie(currentUser.isAdmin);
      return;
    }
    
    // Check if user has 2FA enabled
    const preferencesService = new UserPreferencesService();
    const twoFactorEnabled = await preferencesService.getTwoFactorEnabled(currentUser.id);
    
    // If 2FA is enabled, generate and send code
    if (twoFactorEnabled) {
      const twoFactorService = new TwoFactorAuthService();
      const emailService = new EmailService();
      
      // Store user info for the verification page
      sessionStorage.setItem('pendingVerificationUserId', currentUser.id);
      sessionStorage.setItem('pendingVerificationEmail', currentUser.email);
      if (currentUser.name) {
        sessionStorage.setItem('pendingVerificationName', currentUser.name);
      }
      
      // Generate verification code
      const code = await twoFactorService.initiateVerification(currentUser.id, currentUser.email);
      
      if (code) {
        // Send code via email
        await emailService.send2FACode(
          currentUser.email,
          currentUser.name || 'User',
          code
        );
        
        // Redirect to 2FA verification page
        window.location.href = '/verify-2fa';
        return;
      } else {
        throw new Error("Failed to generate verification code");
      }
    }
    
    // If 2FA is not enabled, complete login normally
    onSetUser(currentUser);
    onSetAdmin(!!currentUser.isAdmin);
    onManageCookie(currentUser.isAdmin);
  } catch (error) {
    throw error;
  }
}