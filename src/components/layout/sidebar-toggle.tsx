'use client';

import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
  /** When true, only render the floating reopen control (sidebar fully hidden). */
  floating?: boolean;
  className?: string;
}

/**
 * Collapse control without a solid colored “box” behind the icon.
 * Inline (inside sidebar header) uses a transparent hover chip;
 * floating (sidebar closed) uses a light surface matching the app background.
 */
export function SidebarToggle({ collapsed, onToggle, floating = false, className }: SidebarToggleProps) {
  if (floating) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border/80 bg-white/95 text-brand-primary shadow-card backdrop-blur-sm transition-all hover:border-brand-primary/30 hover:bg-brand-primary-light hover:shadow-elevated',
          className
        )}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 hover:text-white',
        className
      )}
      aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
    >
      {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
    </button>
  );
}
