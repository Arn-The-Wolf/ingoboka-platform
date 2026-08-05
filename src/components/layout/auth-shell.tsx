'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { LocaleSwitcher } from './locale-switcher';

interface AuthShellProps {
  children: ReactNode;
}

/** Auth pages — branded split-panel layout on desktop, single column on mobile. */
export function AuthShell({ children }: AuthShellProps) {
  const tCommon = useTranslations('common');

  return (
    <div className="relative min-h-screen bg-brand-background lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-brand-accent/15 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl lg:h-screen">
        {/* Branded illustration panel — desktop only */}
        <AuthBrandPanel />

        {/* Form panel */}
        <main className="flex flex-1 flex-col">
          {/* Compact brand header — mobile only */}
          <div className="flex items-center justify-between p-4 lg:justify-end lg:p-6">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-elevated">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-brand-primary-dark">{tCommon('appName')}</span>
            </div>
            <LocaleSwitcher />
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-8 lg:px-10">
            <div className="portal-card w-full max-w-md animate-fade-in-up overflow-y-auto p-5 lg:max-h-[calc(100vh-120px)] lg:p-7">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
