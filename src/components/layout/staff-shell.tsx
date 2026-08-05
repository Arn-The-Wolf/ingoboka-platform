'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';

interface StaffShellContextValue {
  /** Desktop rail collapsed to icon-only width (xl+ only). */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile/tablet overlay drawer open (below xl). */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const StaffShellContext = createContext<StaffShellContextValue | null>(null);

/** Access the responsive shell state from a sidebar rendered inside {@link StaffShell}. */
export function useStaffShell(): StaffShellContextValue {
  const ctx = useContext(StaffShellContext);
  if (!ctx) {
    throw new Error('useStaffShell must be used within a StaffShell');
  }
  return ctx;
}

interface StaffShellProps {
  /** The portal sidebar (rendered inside the provider so it can read shell state). */
  sidebar: ReactNode;
  children: ReactNode;
  /** Background/utility classes for the outer container. */
  className?: string;
}

/**
 * Responsive shell for the staff portals (admin / insurer / agent).
 *
 * - Below `xl` the sidebar is an overlay drawer: closed by default, opened via a
 *   floating control, dimmed backdrop behind it, and the main content spans full width.
 * - At `xl`+ the sidebar is a persistent column that can collapse to an icon rail;
 *   the main region offsets by the current rail width and uses `min-w-0`/`flex-1`
 *   so it shrinks instead of overflowing horizontally.
 */
export function StaffShell({ sidebar, children, className }: StaffShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const value: StaffShellContextValue = {
    collapsed,
    toggleCollapsed: () => setCollapsed((v) => !v),
    mobileOpen,
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
  };

  return (
    <StaffShellContext.Provider value={value}>
      <div className={cn('flex h-screen min-w-0 overflow-hidden', className)}>
        {sidebar}

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-brand-primary-dark/40 backdrop-blur-sm xl:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        <SidebarToggle
          collapsed
          floating
          onToggle={() => setMobileOpen(true)}
          className={cn('xl:hidden', mobileOpen && 'pointer-events-none opacity-0')}
        />

        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-hidden transition-[padding] duration-300',
            collapsed ? 'xl:pl-16' : 'xl:pl-64'
          )}
        >
          {children}
        </div>
      </div>
    </StaffShellContext.Provider>
  );
}
