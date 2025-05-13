import { Client, Account } from 'appwrite';

/**
 * Service to handle password reset flows
 */
export class PasswordResetService {
  private client: Client;
  private account: Account;
  private resetRedirectUrl: string;

  /**
   * Initialize the password reset service
   * @param resetRedirectUrl The URL to redirect to after clicking the reset link
   */
  constructor(resetRedirectUrl?: string) {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
      
    this.account = new Account(this.client);
    
    // Default to the app URL or use the provided URL
    this.resetRedirectUrl = resetRedirectUrl || 
      (typeof window !== 'undefined' ? `${window.location.origin}/reset-password/confirm` : 'https://gradetracker.app/reset-password/confirm');
  }

  /**
   * Request a password reset for the provided email
   * 
   * @param email User's email address
   * @returns Result object with success status and message
   */
  async requestPasswordReset(email: string) {
    try {
      await this.account.createRecovery(email, this.resetRedirectUrl);
      
      return {
        success: true,
        message: `Password reset email sent to ${email}. Please check your inbox.`
      };
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      
      if (error.code === 404) {
        return {
          success: false,
          error: 'No account found with this email address.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send password reset email.'
      };
    }
  }

  /**
   * Complete the password reset process
   * 
   * @param userId User ID from the reset URL
   * @param secret Reset token from the URL
   * @param password New password
   * @param passwordConfirm Confirmation of the new password
   * @returns Result object with success status and message
   */
  async completePasswordReset(userId: string, secret: string, password: string, passwordConfirm: string) {
    try {
      await this.account.updateRecovery(userId, secret, password, passwordConfirm);
      
      return {
        success: true,
        message: 'Your password has been successfully reset. You can now log in with your new password.'
      };
    } catch (error: any) {
      console.error('Error completing password reset:', error);
      
      if (error.code === 401) {
        return {
          success: false,
          error: 'Invalid or expired reset link. Please request a new password reset.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to reset password. Please try again.'
      };
    }
  }
}