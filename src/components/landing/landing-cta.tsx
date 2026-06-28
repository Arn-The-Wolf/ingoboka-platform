'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';

export function LandingCta() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary to-brand-primary-dark px-8 py-12 text-center text-white shadow-elevated lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-accent/20 blur-2xl" />

          <div className="relative">
            <h2 className="mb-3 text-2xl font-bold lg:text-3xl">{t('cta.title')}</h2>
            <p className="mx-auto mb-8 max-w-xl text-base text-white/85 lg:text-lg">{t('cta.subtitle')}</p>
            <LoadingLink href="/register" className="inline-block">
              <Button
                variant="pill-accent"
                className="gap-2 px-8 py-6 text-base font-bold shadow-modal"
              >
                {t('cta.button')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </LoadingLink>
          </div>
        </div>
      </div>
    </section>
  );
}
