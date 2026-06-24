'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';

interface CitizenHeaderProps {
  title: string;
  subtitle?: string;
}

/** Top app bar — matches policy_wallet_dashboard / product_catalog design. */
export function CitizenHeader({ title, subtitle }: CitizenHeaderProps) {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/40 bg-brand-background">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 text-brand-primary transition-colors hover:bg-brand-surface-container-low"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-brand-primary">{t('appName')}</h1>
            {(title !== t('appName') || subtitle) && (
              <p className="text-xs text-brand-muted">{subtitle ?? title}</p>
            )}
          </div>
        </div>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
