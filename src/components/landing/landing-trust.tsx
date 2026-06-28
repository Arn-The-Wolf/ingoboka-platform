'use client';

import { Scale, Building2, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
        <SectionHeading title={t('trust.title')} subtitle={t('trust.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article
              key={titleKey}
              className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary-light">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-brand-primary-dark">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{t(bodyKey)}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-brand-outline">{t('trust.verifyPolicy')}</p>
      </div>
    </section>
  );
}
