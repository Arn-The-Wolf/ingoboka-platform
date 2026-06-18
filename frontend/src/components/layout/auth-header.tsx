'use client';

import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';

export function AuthHeader() {
  const t = useTranslations('common');

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-elevated">
          <Shield className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-brand-primary-dark">{t('appName')}</span>
      </div>
      <LocaleSwitcher />
    </header>
  );
}
