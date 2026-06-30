'use client';

import { Scale, Building2, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SectionHeading } from './section-heading';

const TRUST_ITEMS = [
  {
    icon: Scale,
    titleKey: 'trust.dataProtection.title' as const,
    bodyKey: 'trust.dataProtection.body' as const,
  },
  {
    icon: Building2,
    titleKey: 'trust.licensedPartners.title' as const,
    bodyKey: 'trust.licensedPartners.body' as const,
  },
  {
    icon: Lock,
    titleKey: 'trust.securePayments.title' as const,
    bodyKey: 'trust.securePayments.body' as const,
  },
];

export function LandingTrust() {
  const t = useTranslations('landing');

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('trust.title')} subtitle={t('trust.subtitle')} />
        </AnimatedSection>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
            <AnimatedSection key={titleKey} delay={index * 80}>
              <article className="group interactive-card h-full rounded-2xl border border-brand-border/60 bg-white p-6 shadow-card">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary-light transition-all duration-300 group-hover:bg-brand-primary group-hover:shadow-elevated">
                  <Icon className="h-5 w-5 text-brand-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-brand-primary-dark">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{t(bodyKey)}</p>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={200}>
          <p className="mt-8 text-center text-sm text-brand-outline">{t('trust.verifyPolicy')}</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
