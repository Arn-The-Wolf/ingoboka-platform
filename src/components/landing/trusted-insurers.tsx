'use client';

import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { BrandLogo } from '@/components/ui/brand-logo';
import { SectionHeading } from '@/components/landing/section-heading';
import { INSURER_LOGOS } from '@/lib/brand-logos';
import { cn } from '@/lib/utils';

export function TrustedInsurers() {
  const t = useTranslations('landing');

  return (
    <section className="bg-brand-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('insurers.title')} subtitle={t('insurers.subtitle')} />
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {INSURER_LOGOS.map((insurer) => (
              <div
                key={insurer.name}
                className={cn(
                  'flex h-20 items-center justify-center rounded-xl border border-brand-border/60 bg-white px-4 py-3',
                  'shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card'
                )}
                title={insurer.name}
              >
                <BrandLogo
                  name={insurer.name}
                  src={insurer.src}
                  fallbackSrc={insurer.fallbackSrc}
                  width={120}
                  height={48}
                  imgClassName="h-10 w-auto max-w-full object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <p className="mt-8 text-center text-xs text-brand-outline">{t('insurers.disclaimer')}</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
