'use client';

import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CitizenHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
}

/** Top app bar for citizen portal — full-width web header. */
export function CitizenHeader({ title, subtitle, showNotifications = true }: CitizenHeaderProps) {
  const t = useTranslations('common');
  const tCitizen = useTranslations('citizen.notifications');

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/40 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-8">
        <div>
          <h1 className="text-xl font-bold text-brand-primary-dark lg:text-2xl">
            {title === t('appName') ? title : title}
          </h1>
          {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-brand-primary transition-colors hover:bg-brand-primary-light lg:hidden"
              aria-label={tCitizen('nav')}
            >
              <Bell className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
