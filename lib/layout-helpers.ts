/**
 * Helper function to determine if a route should use the default layout with sidebar
 * @param pathname The current route pathname
 * @returns Boolean indicating whether to use default layout
 */
export function shouldShowSidebar(pathname: string): boolean {
  // List of routes that should not have a sidebar
  const noSidebarRoutes = [
    '/login',
    '/register',
    '/reset-password',
    '/verify-email',
  ];
  
  // Check if the current pathname starts with any of the excluded routes
  return !noSidebarRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}