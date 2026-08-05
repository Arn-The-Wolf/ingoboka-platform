'use client';

import { type ReactNode } from 'react';
import { Shield, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { useStaffShell } from '@/components/layout/staff-shell';

export interface StaffNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}

interface StaffSidebarProps {
  items: StaffNavItem[];
  brandLabel?: string;
  /** Footer content (user card, logout, …). Rendered inside the shell provider. */
  footer?: ReactNode;
}

/**
 * Shared presentational sidebar for the staff portals. Reads its open/collapsed
 * state from {@link useStaffShell}: an overlay drawer below `xl`, a collapsible
 * persistent rail at `xl`+.
 */
export function StaffSidebar({ items, brandLabel = 'Ingoboka', footer }: StaffSidebarProps) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useStaffShell();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-brand-primary-darker bg-gradient-to-b from-brand-primary to-brand-primary-darker text-white transition-all duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'xl:translate-x-0',
        collapsed ? 'xl:w-16' : 'xl:w-64'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b border-brand-primary-darker px-4 py-4',
          collapsed && 'xl:justify-center xl:gap-0 xl:px-2'
        )}
      >
        <Link
          href="/"
          onClick={closeMobile}
          className={cn(
            'flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90',
            collapsed && 'xl:hidden'
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <p className="truncate text-lg font-bold">{brandLabel}</p>
        </Link>

        {/* Desktop collapse / expand rail control. */}
        <SidebarToggle collapsed={collapsed} onToggle={toggleCollapsed} className="hidden xl:flex" />
        {/* Mobile/tablet close-drawer control. */}
        <SidebarToggle collapsed={false} onToggle={closeMobile} className="xl:hidden" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarNavLink
              key={`${item.href}-${item.label}`}
              href={item.href}
              active={item.active}
              collapsed={collapsed}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('h-4 w-4 shrink-0', item.active && 'text-brand-accent')} />
              <span className={cn('truncate', collapsed && 'xl:hidden')}>{item.label}</span>
            </SidebarNavLink>
          );
        })}
      </nav>

      {footer && (
        <div className="border-t border-brand-primary-darker bg-brand-primary-darker/50 p-3">
          {footer}
        </div>
      )}
    </aside>
  );
}
