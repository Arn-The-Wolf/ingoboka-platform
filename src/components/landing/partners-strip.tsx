'use client';

import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { BrandLogo } from '@/components/ui/brand-logo';
import { PARTNER_LOGOS } from '@/lib/brand-logos';

const LABEL_BY_NAME: Record<string, 'partners.airtel' | 'partners.risa' | 'partners.insurers' | 'partners.momo'> = {
  'Airtel Money': 'partners.airtel',
  RISA: 'partners.risa',
  'Licensed insurers': 'partners.insurers',
  'MTN MoMo': 'partners.momo',
};

export function PartnersStrip() {
  const t = useTranslations('landing');
  const items = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <AnimatedSection>
      <section className="border-y border-brand-border/40 bg-white py-8">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-brand-outline">
          {t('partners.title')}
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
          <div className="flex w-max animate-marquee items-center gap-12 px-6">
            {items.map((partner, index) => {
              const labelKey = LABEL_BY_NAME[partner.name];
              return (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex shrink-0 flex-col items-center gap-2 transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex h-12 w-[140px] items-center justify-center rounded-xl bg-brand-surface-container/40 px-3 py-2">
                    <BrandLogo
                      name={partner.name}
                      src={partner.src}
                      fallbackSrc={partner.fallbackSrc}
                      width={120}
                      height={40}
                      imgClassName="h-9 w-auto max-w-[120px]"
                    />
                  </div>
                  <span className="text-xs font-medium text-brand-muted">{t(labelKey)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
