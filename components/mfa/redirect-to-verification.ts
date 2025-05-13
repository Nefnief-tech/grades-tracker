/**
 * Handles redirection to the MFA verification page
 * This function ensures all the challenge data is stored
 * and the user is redirected to the verification page
 */
export function redirectToVerification(email: string, challengeId: string): void {
  try {
    // Store challenge data in multiple locations
    localStorage.setItem('mfa_challenge_id', challengeId);
    localStorage.setItem('mfa_email', email);
    sessionStorage.setItem('mfa_challenge_id', challengeId);
    sessionStorage.setItem('mfa_email', email);
    document.cookie = `mfa_required=true; path=/; max-age=3600; SameSite=Strict`;
    document.cookie = `mfa_challenge_id=${challengeId}; path=/; max-age=3600; SameSite=Strict`;
    document.cookie = `mfa_email=${email}; path=/; max-age=3600; SameSite=Strict`;
    
    // Build verification URL with parameters
    const verifyUrl = `/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challengeId}`;
    
    // Log what's happening
    console.log('[MFA Redirect] Redirecting to verification page:', verifyUrl);
    
    // Use location.replace for hard navigation (most reliable)
    window.location.replace(verifyUrl);
    
    // Fallback in case location.replace fails
    setTimeout(() => {
      if (!window.location.pathname.includes('verify-mfa')) {
        console.log('[MFA Redirect] Primary redirect failed, using fallback');
        window.location.href = verifyUrl;
      }
    }, 500);
  } catch (error) {
    console.error('[MFA Redirect] Error during redirect:', error);
    
    // Last resort - show alert with direct link
    alert(`Please go to this URL: ${window.location.origin}/verify-mfa?email=${encodeURIComponent(email)}&challengeId=${challengeId}`);
  }
}