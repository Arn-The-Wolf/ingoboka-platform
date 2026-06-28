'use client';

import { HeartPulse, Shield, Flower2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './section-heading';

const PRODUCTS = [
  {
    key: 'personalAccident' as const,
    icon: Shield,
    accent: 'bg-brand-primary-light text-brand-primary',
  },
  {
    key: 'familyHealth' as const,
    icon: HeartPulse,
    accent: 'bg-brand-accent/20 text-brand-secondary',
  },
  {
    key: 'funeralCover' as const,
    icon: Flower2,
    accent: 'bg-brand-surface-container text-brand-outline',
  },
];

export function LandingProducts() {
  const t = useTranslations('landing');

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading title={t('products.title')} subtitle={t('products.subtitle')} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PRODUCTS.map(({ key, icon: Icon, accent }) => (
            <article
              key={key}
              className="flex flex-col rounded-2xl border border-brand-border/60 bg-brand-background p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark">
                {t(`products.${key}.name`)}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-brand-muted">
                {t(`products.${key}.description`)}
              </p>
              <p className="mb-4 text-sm font-bold text-brand-primary">
                {t('products.fromPrice', { price: t(`products.${key}.price`) })}
              </p>
              <LoadingLink href="/register">
                <Button variant="outline" className="w-full gap-2 rounded-full">
                  {t('products.enrollCta')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </LoadingLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
