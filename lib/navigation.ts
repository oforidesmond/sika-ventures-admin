import { LayoutDashboard, Package, TrendingUp, Warehouse, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  id: 'dashboard' | 'products' | 'sales' | 'inventory' | 'settings';
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', href: '/products', icon: Package },
  { id: 'sales', label: 'Sales Reports', href: '/sales', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Warehouse },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];
