// This file re-exports from our proper implementation to maintain compatibility
import { handleMfaLogin, verifyMfaChallenge, isMfaEnabled } from './mfa-handler';

console.log('****************************************');
console.log('*** MFA-LOGIN IS REDIRECTING TO MFA-HANDLER');
console.log('*** Using mfa-handler.ts implementation instead');
console.log('****************************************');

export {
  handleMfaLogin,
  verifyMfaChallenge,
  isMfaEnabled
};