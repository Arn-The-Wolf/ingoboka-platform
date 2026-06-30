'use client';

import { Building2, CreditCard, Shield, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';

const PARTNERS = [
  { icon: Smartphone, labelKey: 'partners.momo' as const },
  { icon: CreditCard, labelKey: 'partners.airtel' as const },
  { icon: Shield, labelKey: 'partners.risa' as const },
  { icon: Building2, labelKey: 'partners.insurers' as const },
];

export function PartnersStrip() {
  const t = useTranslations('landing');

  const items = [...PARTNERS, ...PARTNERS];

  return (
    <AnimatedSection>
      <section className="border-y border-brand-border/40 bg-white py-8">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-brand-outline">
          {t('partners.title')}
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 px-4">
            {items.map(({ icon: Icon, labelKey }, index) => (
              <div
                key={`${labelKey}-${index}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-brand-border/50 bg-brand-background px-5 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
              >
                <Icon className="h-4 w-4 text-brand-primary" />
                {t(labelKey)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
