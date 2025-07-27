import { useLocation } from 'react-router-dom';
import { Home, User, Settings } from 'lucide-react';

import { SidebarItem } from './SidebarItem';

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <SidebarItem
        icon={Home}
        label="Home"
        path="/"
        isActive={location.pathname === '/'}
      />
      <SidebarItem
        icon={User}
        label="Profile"
        path="/profile"
        isActive={location.pathname === '/profile'}
      />
      <SidebarItem
        icon={Settings}
        label="Settings"
        path="/settings"
        isActive={location.pathname === '/settings'}
      />
    </div>
  );
}