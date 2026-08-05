'use client';

import { useTranslations } from 'next-intl';
import { Clock, Shield, ShieldCheck, Wallet } from 'lucide-react';

/** Branded left column for the desktop auth layout: illustration + value props. */
export function AuthBrandPanel() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const valueProps = [
    { icon: ShieldCheck, title: t('valuePropCoverTitle'), body: t('valuePropCoverBody') },
    { icon: Wallet, title: t('valuePropWalletTitle'), body: t('valuePropWalletBody') },
    { icon: Clock, title: t('valuePropFastTitle'), body: t('valuePropFastBody') },
  ];

  return (
    <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-dark p-10 text-white lg:flex">
      <div className="pointer-events-none absolute inset-0 auth-dot-pattern opacity-20" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -left-12 bottom-8 h-52 w-52 rounded-full bg-white/10 blur-3xl animate-float-delayed" />

      <div className="relative flex items-center gap-3 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xl font-bold">{tCommon('appName')}</p>
          <p className="text-sm text-white/70">{t('heroTagline')}</p>
        </div>
      </div>

      <div className="relative space-y-8">
        <div className="max-w-md space-y-3 animate-fade-in-up">
          <h2 className="text-3xl font-bold leading-tight lg:text-4xl">{t('heroTitle')}</h2>
          <p className="text-base text-white/80">{t('heroSubtitle')}</p>
        </div>

        {/* Illustrated coverage card */}
        <div className="animate-fade-in-up stagger-2">
          <div className="max-w-sm rounded-2xl border border-white/20 bg-white/10 p-5 shadow-modal backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-wide">{tCommon('appName')}</span>
              </div>
              <span className="rounded-full bg-brand-accent/90 px-3 py-1 text-xs font-semibold text-brand-primary-dark">
                {t('heroCardStatus')}
              </span>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/60">{t('heroCardHolder')}</p>
              <div className="h-2.5 w-2/3 rounded-full bg-white/40" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {t('heroCardCoverageLabel')}
                </p>
                <p className="text-2xl font-bold">2,000,000 RWF</p>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/50" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ul className="space-y-4">
          {valueProps.map((prop, i) => {
            const Icon = prop.icon;
            return (
              <li key={prop.title} className={`flex gap-3 animate-fade-in-up stagger-${i + 3}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{prop.title}</p>
                  <p className="text-sm text-white/70">{prop.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="relative text-sm text-white/60 animate-fade-in">{t('heroFooter')}</p>
    </aside>
  );
}
