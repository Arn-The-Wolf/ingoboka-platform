'use client';

import { ReactNode, useEffect } from 'react';
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

  // Lock document scroll so neither login nor registration can scroll the page.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 overflow-hidden bg-brand-background">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
        {/* Full-bleed left brand column (desktop) — no outer margin/padding */}
        <AuthBrandPanel />

        <main className="flex h-full min-h-0 flex-col bg-brand-background">
          <div className="flex shrink-0 items-center justify-between px-4 py-3 lg:justify-end lg:px-6 lg:py-4">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-elevated">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-brand-primary-dark">{tCommon('appName')}</span>
            </div>
            <LocaleSwitcher />
          </div>

          {/* Only the form column may scroll on short viewports; the page never does. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="flex min-h-full items-center justify-center px-4 py-4 sm:py-6 lg:px-10">
              <div className="portal-card w-full max-w-md animate-fade-in-up p-5 lg:p-7">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
