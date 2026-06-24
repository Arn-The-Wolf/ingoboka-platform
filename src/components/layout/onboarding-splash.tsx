'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';
import { cn } from '@/lib/utils';

const SLIDES = [
  {
    titleKey: 'onboardingSlide1Title' as const,
    bodyKey: 'onboardingSlide1Body' as const,
  },
  {
    titleKey: 'onboardingSlide2Title' as const,
    bodyKey: 'onboardingSlide2Body' as const,
  },
  {
    titleKey: 'onboardingSlide3Title' as const,
    bodyKey: 'onboardingSlide3Body' as const,
  },
];

/** Splash onboarding — matches splash_onboarding / language_selection designs. */
export function OnboardingSplash() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const [slide, setSlide] = useState(0);

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-background">
      <header className="flex h-20 items-center justify-center">
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">{tCommon('appName')}</h1>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between px-4 py-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold text-brand-muted">{t('taglineRw')}</p>
          <p className="text-xs text-brand-outline">{t('taglineEn')}</p>
        </div>

        <section className="flex flex-col items-center py-8">
          <div className="relative mb-8 flex aspect-square w-72 items-center justify-center overflow-hidden rounded-[2rem] bg-brand-surface-container-low shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(#1B6B3A_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
            <div className="z-10 flex h-40 w-40 items-center justify-center rounded-full bg-brand-primary-light">
              <span className="text-6xl">🛡️</span>
            </div>
          </div>

          <div className="mb-6 px-4 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-brand-primary">
              {t(SLIDES[slide].titleKey)}
            </h2>
            <p className="text-base text-brand-muted">{t(SLIDES[slide].bodyKey)}</p>
          </div>

          <div className="flex gap-1">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === slide ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-border'
                )}
              />
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4">
          <div className="mb-2">
            <LocaleSwitcher />
          </div>
          <Link href="/register" className="w-full">
            <Button variant="pill-accent" className="w-full gap-2 py-6 text-base font-bold">
              {t('getStarted')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full rounded-full py-3 text-brand-muted">
              {t('skip')}
            </Button>
          </Link>
        </footer>
      </main>

      <div className="pointer-events-none fixed top-24 -right-12 h-48 w-48 rounded-full bg-brand-primary-light/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-24 -left-12 h-48 w-48 rounded-full bg-brand-accent/20 blur-3xl" />
    </div>
  );
}
