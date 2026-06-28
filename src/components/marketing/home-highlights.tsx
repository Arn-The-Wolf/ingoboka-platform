'use client';

import { ArrowRight, Layers, Route, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const HIGHLIGHTS = [
  {
    href: '/features' as const,
    icon: Layers,
    titleKey: 'home.highlights.features.title' as const,
    bodyKey: 'home.highlights.features.body' as const,
    linkKey: 'home.highlights.learnMore' as const,
    accent: 'bg-brand-primary-light text-brand-primary',
  },
  {
    href: '/how-it-works' as const,
    icon: Route,
    titleKey: 'home.highlights.howItWorks.title' as const,
    bodyKey: 'home.highlights.howItWorks.body' as const,
    linkKey: 'home.highlights.learnMore' as const,
    accent: 'bg-brand-accent/20 text-brand-secondary',
  },
  {
    href: '/plans' as const,
    icon: Shield,
    titleKey: 'home.highlights.plans.title' as const,
    bodyKey: 'home.highlights.plans.body' as const,
    linkKey: 'home.highlights.viewPlans' as const,
    accent: 'bg-brand-surface-container text-brand-outline',
  },
];

export function HomeHighlights() {
  const t = useTranslations('landing');

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading title={t('home.highlights.title')} subtitle={t('home.highlights.subtitle')} />

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {HIGHLIGHTS.map(({ href, icon: Icon, titleKey, bodyKey, linkKey, accent }) => (
            <LoadingLink
              key={href}
              href={href}
              className={cn(
                'group flex flex-col rounded-2xl border border-brand-border/60 bg-brand-background p-6',
                'transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-elevated'
              )}
            >
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', accent)}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark">{t(titleKey)}</h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-brand-muted">{t(bodyKey)}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary group-hover:gap-2">
                {t(linkKey)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </LoadingLink>
          ))}
        </div>
      </div>
    </section>
  );
}
