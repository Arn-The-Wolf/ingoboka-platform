'use client';

import { NotificationBell } from '@/components/citizen/notification-bell';

interface CitizenHeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
}

/** Top app bar for citizen portal — full-width web header. */
export function CitizenHeader({ title, subtitle, showNotifications = true }: CitizenHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/40 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-8">
        <div>
          {title && (
            <h1 className="text-xl font-bold text-brand-primary-dark lg:text-2xl">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showNotifications && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}
