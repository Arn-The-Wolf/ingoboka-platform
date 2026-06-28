'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { LocaleSwitcher } from './locale-switcher';

interface AuthShellProps {
  children: ReactNode;
}

/** Auth pages — split-panel web layout on desktop, centered card on mobile. */
export function AuthShell({ children }: AuthShellProps) {
  const tCommon = useTranslations('common');
  const tLanding = useTranslations('landing');

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-brand-accent/15 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl">
        {/* Brand panel — desktop only */}
        <aside className="hidden w-1/2 flex-col justify-between border-r border-brand-border/60 bg-gradient-to-br from-brand-primary to-brand-primary-dark p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">{tCommon('appName')}</p>
              <p className="text-sm text-white/75">{tLanding('tagline')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">{tLanding('onboardingSlide1Title')}</h2>
            <p className="max-w-md text-base text-white/85">{tLanding('onboardingSlide1Body')}</p>
          </div>
          <p className="text-sm text-white/60">© Ingoboka — Digital Microinsurance for Rwanda</p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-1 flex-col">
          <div className="flex justify-end p-4 lg:p-6">
            <LocaleSwitcher />
          </div>
          <div className="flex flex-1 items-center justify-center px-4 pb-8 lg:px-10">
            <div className="w-full max-w-lg rounded-2xl border border-brand-border/60 bg-white p-6 shadow-card lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
