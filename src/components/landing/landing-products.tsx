'use client';

import { HeartPulse, Shield, Flower2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';

const PRODUCTS = [
  {
    key: 'personalAccident' as const,
    icon: Shield,
    accent: 'bg-brand-primary-light text-brand-primary',
    popular: false,
  },
  {
    key: 'familyHealth' as const,
    icon: HeartPulse,
    accent: 'bg-brand-accent/20 text-brand-secondary',
    popular: true,
  },
  {
    key: 'funeralCover' as const,
    icon: Flower2,
    accent: 'bg-brand-surface-container text-brand-outline',
    popular: false,
  },
];

export function LandingProducts() {
  const t = useTranslations('landing');

  const cards = PRODUCTS.map(({ key, icon: Icon, accent, popular }) => (
    <article
      key={key}
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-brand-border/60 bg-brand-background p-6 shadow-card',
        'interactive-card',
        popular && 'border-brand-primary/40 ring-1 ring-brand-primary/10'
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-3 py-0.5 text-xs font-bold text-brand-primary-dark shadow-sm">
          {t('products.mostPopular')}
        </span>
      )}
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110',
          accent
        )}
      >
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
        <Button variant="outline" className="w-full gap-2 rounded-full transition-all group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-white">
          {t('products.enrollCta')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </LoadingLink>
    </article>
  ));

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('products.title')} subtitle={t('products.subtitle')} />
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="md:hidden">
            <Carousel ariaLabel={t('products.title')}>{cards}</Carousel>
          </div>
          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {cards}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
