'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

/**
 * Real, currently-operating licensed Rwandan insurers (source: BNR list of
 * licensed insurers). Logos are loaded by URL via Clearbit's logo API
 * (registered in next.config.js) and gracefully fall back to a clean brand
 * wordmark when a logo URL is unavailable — no binary logos are stored in-repo.
 */
const INSURERS: { name: string; domain: string }[] = [
  { name: 'Radiant Insurance', domain: 'radiant.rw' },
  { name: 'Prime Insurance', domain: 'prime.rw' },
  { name: 'Sanlam', domain: 'sanlam.com' },
  { name: 'Sonarwa', domain: 'sonarwa.co.rw' },
  { name: 'BK Insurance', domain: 'bkinsurance.rw' },
  { name: 'Britam', domain: 'britam.com' },
  { name: 'Old Mutual', domain: 'oldmutual.rw' },
  { name: 'MUA', domain: 'muainsurance.rw' },
  { name: 'RSSB', domain: 'rssb.rw' },
];

function logoUrl(domain: string) {
  return `https://logo.clearbit.com/${domain}?size=120`;
}

function InsurerLogo({ name, domain }: { name: string; domain: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        'flex h-20 items-center justify-center rounded-xl border border-brand-border/60 bg-white px-4 py-3',
        'shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card'
      )}
      title={name}
    >
      {failed ? (
        <span className="text-center text-sm font-bold tracking-tight text-brand-primary-dark">
          {name}
        </span>
      ) : (
        <Image
          src={logoUrl(domain)}
          alt={name}
          width={120}
          height={48}
          className="h-10 w-auto object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          onError={() => setFailed(true)}
          unoptimized
        />
      )}
    </div>
  );
}

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
            {INSURERS.map((insurer) => (
              <InsurerLogo key={insurer.domain} name={insurer.name} domain={insurer.domain} />
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
