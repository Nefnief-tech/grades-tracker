import { Client, Account, ID, AppwriteException, AuthenticationFactor, Models } from 'appwrite';

/**
 * Service for handling two-factor authentication using Appwrite's official MFA API
 */
export class AppwriteMFA {
  private client: Client;
  private account: Account;

  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    this.account = new Account(this.client);
  }

  /**
   * Get the current user's MFA factors
   */
  async listFactors(): Promise<Models.MfaFactors> {
    try {
      return await this.account.listMfaFactors();
    } catch (error) {
      console.error('Error listing MFA factors:', error);
      throw error;
    }
  }

  /**
   * Check if MFA is enabled for the current user
   */
  async isMfaEnabled(): Promise<boolean> {
    try {
      const factors = await this.account.listMfaFactors();
      return !!(factors.totp || factors.phone || factors.email);
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Create a challenge for email verification
   */
  async createEmailChallenge(): Promise<Models.MfaChallenge> {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Email);
    } catch (error) {
      console.error('Error creating email challenge:', error);
      throw error;
    }
  }

  /**
   * Create a challenge for TOTP verification
   */
  async createTotpChallenge(): Promise<Models.MfaChallenge> {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Totp);
    } catch (error) {
      console.error('Error creating TOTP challenge:', error);
      throw error;
    }
  }

  /**
   * Create a challenge for SMS verification
   */
  async createPhoneChallenge(): Promise<Models.MfaChallenge> {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Phone);
    } catch (error) {
      console.error('Error creating phone challenge:', error);
      throw error;
    }
  }

  /**
   * Create a challenge for recovery code verification
   */
  async createRecoveryChallenge(): Promise<Models.MfaChallenge> {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Recoverycode);
    } catch (error) {
      console.error('Error creating recovery challenge:', error);
      throw error;
    }
  }

  /**
   * Verify a challenge with a code
   * @param challengeId The ID of the challenge to verify
   * @param code The verification code
   */
  async verifyChallenge(challengeId: string, code: string): Promise<Models.MfaChallenge> {
    try {
      return await this.account.updateMfaChallenge(challengeId, code);
    } catch (error) {
      console.error('Error verifying challenge:', error);
      throw error;
    }
  }

  /**
   * Get recovery codes for the account
   */
  async getRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
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
  async regenerateRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    try {
      return await this.account.updateMfaRecoveryCodes();
    } catch (error) {
      console.error('Error regenerating recovery codes:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const appwriteMFA = new AppwriteMFA();

export default appwriteMFA;