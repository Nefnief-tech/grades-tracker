import { Client, Account } from 'appwrite';

/**
 * Service for handling two-factor authentication using Appwrite
 */
export class AppwriteMFAService {
  private client: Client;
  private account: Account;

  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    this.account = new Account(this.client);
  }

  /**
   * Get MFA factors for the current user
   */
  async getFactors() {
    try {
      return await this.account.listMfaFactors();
    } catch (error) {
      console.error('Error getting MFA factors:', error);
      throw error;
    }
  }

  /**
   * Check if MFA is enabled for the current user
   */
  async isMFAEnabled() {
    try {
      const factors = await this.account.listMfaFactors();
      return !!(factors.totp?.length || factors.phone || factors.email);
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Create a TOTP authenticator factor for the user
   */
  async createTOTPFactor() {
    try {
      return await this.account.createMfaAuthenticator();
    } catch (error) {
      console.error('Error creating TOTP factor:', error);
      throw error;
    }
  }

  /**
   * Complete TOTP setup with verification code
   */
  async completeTOTPSetup(secret: string, code: string) {
    try {
      return await this.account.updateMfaAuthenticator(secret, code);
    } catch (error) {
      console.error('Error completing TOTP setup:', error);
      throw error;
    }
  }

  /**
   * Create a recovery codes for MFA
   */
  async createRecoveryCodes() {
    try {
      return await this.account.createMfaRecoveryCodes();
    } catch (error) {
      console.error('Error creating recovery codes:', error);
      throw error;
    }
  }

  /**
   * Get recovery codes
   */
  async getRecoveryCodes() {
    try {
      return await this.account.getMfaRecoveryCodes();
    } catch (error) {
      console.error('Error getting recovery codes:', error);
      throw error;
    }
  }

  /**
   * Regenerate recovery codes
   */
  async regenerateRecoveryCodes() {
    try {
      return await this.account.updateMfaRecoveryCodes();
    } catch (error) {
      console.error('Error regenerating recovery codes:', error);
      throw error;
    }
  }

  /**
   * Create challenge during login process
   */
  async createChallenge(factorId: string) {
    try {
      return await this.account.createMfaChallenge(factorId);
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      throw error;
    }
  }

  /**
   * Verify challenge during login process
   */
  async verifyChallenge(challengeId: string, code: string) {
    try {
      return await this.account.updateMfaChallenge(challengeId, code);
    } catch (error) {
      console.error('Error verifying challenge:', error);
      throw error;
    }
  }
}