// This file re-exports from our proper implementation to maintain compatibility
// Use * as import to prevent name conflicts
import * as MfaHandlerImpl from './mfa-handler';

console.log('*** REDIRECTING MFA LOGIN HANDLER - Using mfa-handler.ts implementation instead');

// Re-export the functions from the implementation
export const handleMfaLogin = MfaHandlerImpl.handleMfaLogin;
export const verifyMfaChallenge = MfaHandlerImpl.verifyMfaChallenge;
export const isMfaEnabled = MfaHandlerImpl.isMfaEnabled;