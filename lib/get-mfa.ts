/**
 * Helper utility to ensure consistent access to the MFA instance
 * This can help resolve circular dependency issues and import problems
 */
import { appwriteMFA } from './appwrite-mfa';

/**
 * Get the MFA service instance
 * @returns The singleton MFA service instance
 */
export function getMFAInstance() {
  return appwriteMFA;
}