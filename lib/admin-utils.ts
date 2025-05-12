// Utility functions for admin functionality

/**
 * Sets the admin status cookie directly in the browser
 * This is a client-side function for immediate effect
 */
export function setAdminCookie(): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days
  
  document.cookie = `admin-status=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  
  console.log('Admin cookie has been set directly');
}

/**
 * Force reload with admin status
 * Sets the cookie and refreshes the page to ensure middleware picks it up
 */
export function forceAdminReload(): void {
  setAdminCookie();
  window.location.reload();
}