'use client';

import { ArrowRight, Shield, CheckCircle2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATS = [
  { key: 'hero.statAffordable' as const, icon: CheckCircle2 },
  { key: 'hero.statClaims' as const, icon: Shield },
  { key: 'hero.statDigital' as const, icon: Smartphone },
];

export function LandingHero() {
  const t = useTranslations('landing');

  return (
    <section className="relative overflow-hidden py-12 lg:py-20">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 animate-float rounded-full bg-brand-primary-light/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 animate-float-delayed rounded-full bg-brand-accent/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <AnimatedSection className="text-center lg:text-left">
          <p className="mb-6 text-sm font-semibold text-brand-primary lg:text-base">{t('tagline')}</p>

          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-brand-primary lg:text-5xl">
            {t('hero.headline')}
          </h1>
          <p className="mb-8 text-base text-brand-muted lg:text-lg">{t('hero.subheadline')}</p>

          <div className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
            {STATS.map(({ key, icon: Icon }, index) => (
              <span
                key={key}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-brand-border/60 bg-white px-3 py-1.5 text-xs font-semibold text-brand-primary-dark shadow-sm transition-all duration-300 hover:border-brand-primary/40 hover:shadow-elevated lg:text-sm',
                  `animate-fade-in-up stagger-${index + 1}`
                )}
              >
                <Icon className="h-3.5 w-3.5 text-brand-accent" />
                {t(key)}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <LoadingLink href="/register" className="sm:flex-1 lg:flex-none">
              <Button variant="pill-accent" className="w-full gap-2 py-6 text-base font-bold sm:min-w-[200px]">
                {t('getStarted')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </LoadingLink>
            <LoadingLink href="/login" className="sm:flex-1 lg:flex-none">
              <Button variant="outline" className="w-full rounded-full py-6 sm:min-w-[200px]">
                {t('login')}
              </Button>
            </LoadingLink>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={150} className="flex justify-center lg:justify-end">
          <div className="flex aspect-square w-full max-w-md items-center justify-center">
            <div className="absolute inset-4 rounded-3xl bg-[radial-gradient(#1B6B3A_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-brand-border/40 bg-gradient-to-br from-white to-brand-primary-light/40 p-8 shadow-elevated transition-shadow duration-500 hover:shadow-modal">
              <div className="relative">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-brand-accent/20 blur-xl" />
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-brand-primary shadow-elevated transition-transform duration-500 hover:scale-[1.02] lg:h-56 lg:w-56">
                  <Shield className="h-24 w-24 text-white lg:h-28 lg:w-28" strokeWidth={1.25} />
                </div>
                <div
                  className={cn(
                    'absolute -right-2 top-4 flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-white shadow-elevated',
                    'lg:-right-4 lg:top-6 lg:h-16 lg:w-16'
                  )}
                >
                  <CheckCircle2 className="h-7 w-7 text-brand-success lg:h-8 lg:w-8" />
                </div>
                <div
                  className={cn(
                    'absolute -bottom-2 -left-2 flex h-14 w-14 animate-float-delayed items-center justify-center rounded-2xl bg-brand-accent shadow-elevated',
                    'lg:-bottom-4 lg:-left-4 lg:h-16 lg:w-16'
                  )}
                >
                  <Smartphone className="h-7 w-7 text-brand-primary-dark lg:h-8 lg:w-8" />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
