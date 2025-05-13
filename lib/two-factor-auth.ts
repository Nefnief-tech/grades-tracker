import { Client, Account, ID, Databases, Query } from 'appwrite';

/**
 * Service for handling two-factor authentication via email
 * Uses Appwrite's token capabilities and a custom database collection
 */
export class TwoFactorAuthService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private readonly databaseId: string;
  private readonly collectionId: string = 'two_factor_codes';
  
  constructor() {
    this.client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
  }

  /**
   * Generate a random numeric code for 2FA
   */
  private generateVerificationCode(length: number = 6): string {
    // Generate a random numeric code of specified length
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  /**
   * Store a verification code in the database
   * @param userId User ID
   * @param code Verification code
   * @returns Success status
   */
  private async storeVerificationCode(userId: string, code: string): Promise<boolean> {
    try {
      // First, delete any existing codes for this user
      try {
        const existingCodes = await this.databases.listDocuments(
          this.databaseId,
          this.collectionId,
          [Query.equal('userId', userId)]
        );
        
        for (const doc of existingCodes.documents) {
          await this.databases.deleteDocument(
            this.databaseId,
            this.collectionId,
            doc.$id
          );
        }
      } catch (error) {
        console.warn('No existing codes found or error cleaning up:', error);
      }
      
      // Store the new code with expiration (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      await this.databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          userId: userId,
          code: code,
          expiresAt: expiresAt.toISOString()
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error storing verification code:', error);
      return false;
    }
  }

  /**
   * Initiate 2FA verification by generating and storing a code
   * @param userId User's ID
   * @param email User's email address
   * @returns The generated verification code
   */
  async initiateVerification(userId: string, email: string): Promise<string | null> {
    try {
      // Generate a verification code
      const code = this.generateVerificationCode();
      
      // Store it in the database
      const stored = await this.storeVerificationCode(userId, code);
      
      if (!stored) {
        throw new Error('Failed to store verification code');
      }
      
      return code;
    } catch (error) {
      console.error('Error initiating verification:', error);
      return null;
    }
  }

  /**
   * Verify a code provided by the user
   * @param userId User's ID
   * @param code Verification code entered by user
   * @returns Success status
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    try {
      // Retrieve the stored code
      const storedCodes = await this.databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      
      // If no codes found
      if (storedCodes.documents.length === 0) {
        return false;
      }
      
      const storedCode = storedCodes.documents[0];
      
      // Check if code has expired
      const expiresAt = new Date(storedCode.expiresAt);
      if (expiresAt < new Date()) {
        // Delete expired code
        await this.databases.deleteDocument(
          this.databaseId,
          this.collectionId,
          storedCode.$id
        );
        return false;
      }
      
      // Check if code matches
      if (storedCode.code !== code) {
        return false;
      }
      
      // Delete used code
      await this.databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        storedCode.$id
      );
      
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }
}