import { Client, Account, ID } from 'appwrite';
import { initializeAppwrite } from './appwrite';

/**
 * Service to handle user registration and email verification
 */
export class RegistrationService {
  private client: Client;
  private account: Account;
  private redirectUrl: string;

  /**
   * Initialize the registration service
   * @param verificationRedirectUrl The URL to redirect to after email verification
   */
  constructor(verificationRedirectUrl?: string) {
    this.client = initializeAppwrite();
    this.account = new Account(this.client);
    // Default to the app URL or use the provided URL
    this.redirectUrl = verificationRedirectUrl || 
      (typeof window !== 'undefined' ? window.location.origin : 'https://gradetracker.app');
  }

  /**
   * Registers a new user and sends verification email
   * 
   * @param email User's email
   * @param password User's password
   * @param name User's name
   * @returns Created user object
   */
  async registerUser(email: string, password: string, name: string) {
    try {
      // Create the user account
      const user = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Send verification email
      await this.sendVerificationEmail();

      return {
        success: true,
        user: user,
        message: 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 409) {
        return {
          success: false,
          error: 'An account with this email already exists.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Sends a verification email to the currently logged-in user
   */
  async sendVerificationEmail() {
    try {
      await this.account.createVerification(this.redirectUrl);
      return {
        success: true,
        message: 'Verification email sent successfully.'
      };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email.'
      };
    }
  }

  /**
   * Completes the email verification process with the verification token
   * 
   * @param userId User ID from the verification URL
   * @param secret Verification token from the URL
   */
  async completeEmailVerification(userId: string, secret: string) {
    try {
      await this.account.updateVerification(userId, secret);
      return {
        success: true,
        message: 'Email verification successful! Your account is now verified.'
      };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed. The link may be invalid or expired.'
      };
    }
  }
}