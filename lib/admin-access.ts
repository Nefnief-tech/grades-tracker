// Admin access control utility
export const ADMIN_USER_ID = '67d6f7fe0019adf0fd95';

export function isUserAdmin(userId: string | undefined): boolean {
  return userId === ADMIN_USER_ID;
}

export function requireAdmin(userId: string | undefined): void {
  if (!isUserAdmin(userId)) {
    throw new Error('Admin access required');
  }
}

// Hook for admin access
export function useAdminAccess() {
  return {
    ADMIN_USER_ID,
    isUserAdmin,
    requireAdmin
  };
}