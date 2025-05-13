import { Client, Account, AppwriteException, AuthenticationFactor } from 'appwrite';

/**
 * Service for handling two-factor authentication using Appwrite's official MFA API
 */
class MFAService {
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
  async listFactors() {
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
  async isMFAEnabled() {
    try {
      // First, get the account to check if we're authenticated
      await this.account.get();
      
      // Then check the MFA factors
      const factors = await this.account.listMfaFactors();
      
      // If any factor is enabled, MFA is enabled
      return !!(factors.email || factors.phone || factors.totp);
    } catch (error) {
      // Handle 'user_more_factors_required' error which means MFA is enabled but not completed
      if (error instanceof AppwriteException && error.type === 'user_more_factors_required') {
        return true;
      }
      
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Enable or disable MFA for the current user
   */
  async updateMFA(enabled: boolean) {
    try {
      return await this.account.updateMFA(enabled);
    } catch (error) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} MFA:`, error);
      throw error;
    }
  }

  /**
   * Generate recovery codes for MFA
   */
  async createRecoveryCodes() {
    try {
      return await this.account.createMfaRecoveryCodes();
    } catch (error) {
      console.error('Error creating MFA recovery codes:', error);
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
  async createChallenge(factorId: AuthenticationFactor) {
    try {
      return await this.account.createMfaChallenge(factorId);
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      throw error;
    }
  }

  /**
   * Create a challenge for email factor authentication specifically
   */
  async createEmailChallenge() {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Email);
    } catch (error) {
      console.error('Error creating email challenge:', error);
      throw error;
    }
  }

  /**
   * Create a challenge for recovery code authentication
   */
  async createRecoveryChallenge() {
    try {
      return await this.account.createMfaChallenge(AuthenticationFactor.Recoverycode);
    } catch (error) {
      console.error('Error creating recovery code challenge:', error);
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
  
  /**
   * Ensure email is verified (required for MFA)
   */
  async createEmailVerification(url: string) {
    try {
      return await this.account.createVerification(url);
    } catch (error) {
      console.error('Error creating email verification:', error);
      throw error;
    }
  }

  /**
   * Complete email verification
   */
  async completeEmailVerification(userId: string, secret: string) {
    try {
      return await this.account.updateVerification(userId, secret);
    } catch (error) {
      console.error('Error completing email verification:', error);
      throw error;
    }
  }
}

// Create a singleton instance that will be exported
const appwriteMFA = new MFAService();

// Export the singleton instance as default and named export
export default appwriteMFA;
export { appwriteMFA };