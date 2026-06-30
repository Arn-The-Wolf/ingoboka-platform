'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';

const PARTNERS = [
  { src: '/images/partners/mtn.svg', alt: 'MTN MoMo', labelKey: 'partners.momo' as const },
  { src: '/images/partners/airtel.svg', alt: 'Airtel Money', labelKey: 'partners.airtel' as const },
  { src: '/images/partners/risa.svg', alt: 'RISA', labelKey: 'partners.risa' as const },
  { src: '/images/partners/insurers.svg', alt: 'Licensed insurers', labelKey: 'partners.insurers' as const },
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
          <div className="flex w-max animate-marquee items-center gap-10 px-6">
            {items.map(({ src, alt, labelKey }, index) => (
              <div
                key={`${labelKey}-${index}`}
                className="flex shrink-0 flex-col items-center gap-2 transition-transform duration-300 hover:scale-105"
              >
                <Image src={src} alt={alt} width={120} height={40} className="h-10 w-auto" />
                <span className="text-xs font-medium text-brand-muted">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
