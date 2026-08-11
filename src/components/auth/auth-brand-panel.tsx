'use client';

import { useTranslations } from 'next-intl';
import { Clock, ShieldCheck, Wallet } from 'lucide-react';
import Image from 'next/image';

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
    <aside className="auth-brand-panel relative hidden h-full min-h-0 w-full min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-darker text-white lg:flex">
      <div className="pointer-events-none absolute inset-0 auth-dot-pattern opacity-20" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -left-12 bottom-8 h-52 w-52 rounded-full bg-white/10 blur-3xl animate-float-delayed" />

      <div className="auth-brand-pad relative flex h-full min-h-0 flex-col justify-between">
        <div className="relative flex shrink-0 items-center gap-3 animate-fade-in">
          <div className="auth-brand-logo flex items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 p-1.5">
            <Image src="/images/brand/ingoboka-mark-light.svg" alt="" width={28} height={28} aria-hidden />
          </div>
          <div>
            <p className="text-lg font-bold xl:text-xl">{tCommon('appName')}</p>
            <p className="text-xs text-white/70 xl:text-sm">{t('heroTagline')}</p>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 space-y-5 overflow-hidden py-4 xl:space-y-8">
          <div className="max-w-md space-y-2 animate-fade-in-up xl:space-y-3">
            <h2 className="auth-brand-title font-bold leading-tight">{t('heroTitle')}</h2>
            <p className="auth-brand-subtitle text-white/80">{t('heroSubtitle')}</p>
          </div>

          {/* Illustrated coverage card — scales down on short viewports */}
          <div className="auth-brand-card-wrap animate-fade-in-up stagger-2">
            <div className="auth-brand-card max-w-sm rounded-2xl border border-white/20 bg-white/10 shadow-modal backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 p-1">
                    <Image src="/images/brand/ingoboka-mark-light.svg" alt="" width={20} height={20} aria-hidden />
                  </div>
                  <span className="text-sm font-bold tracking-wide">{tCommon('appName')}</span>
                </div>
                <span className="rounded-full bg-brand-accent/90 px-3 py-1 text-xs font-semibold text-brand-primary-dark">
                  {t('heroCardStatus')}
                </span>
              </div>
              <div className="mt-4 space-y-1 xl:mt-6">
                <p className="text-xs uppercase tracking-wide text-white/60">{t('heroCardHolder')}</p>
                <div className="h-2.5 w-2/3 rounded-full bg-white/40" />
              </div>
              <div className="mt-3 flex items-end justify-between xl:mt-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    {t('heroCardCoverageLabel')}
                  </p>
                  <p className="text-xl font-bold xl:text-2xl">2,000,000 RWF</p>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/50" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ul className="auth-brand-values space-y-3 xl:space-y-4">
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

        <p className="auth-brand-footer relative shrink-0 text-sm text-white/60 animate-fade-in">
          {t('heroFooter')}
        </p>
      </div>
    </aside>
  );
}
