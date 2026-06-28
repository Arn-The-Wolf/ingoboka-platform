'use client';

import { UserPlus, Search, CreditCard, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const STEPS = [
  { icon: UserPlus, titleKey: 'howItWorks.step1Title' as const, bodyKey: 'howItWorks.step1Body' as const },
  { icon: Search, titleKey: 'howItWorks.step2Title' as const, bodyKey: 'howItWorks.step2Body' as const },
  { icon: CreditCard, titleKey: 'howItWorks.step3Title' as const, bodyKey: 'howItWorks.step3Body' as const },
  { icon: ShieldCheck, titleKey: 'howItWorks.step4Title' as const, bodyKey: 'howItWorks.step4Body' as const },
];

export function HowItWorksTimeline() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading title={t('howItWorks.title')} subtitle={t('howItWorks.subtitle')} />

        <ol className="relative mx-auto max-w-3xl">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;
            return (
              <li key={step.titleKey} className="relative flex gap-6 pb-12 last:pb-0">
                {!isLast && (
                  <div
                    className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-0.5 bg-brand-border/60"
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    'bg-brand-primary text-white shadow-elevated'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="pt-1">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-accent">
                    {t('howItWorks.stepLabel', { step: index + 1 })}
                  </p>
                  <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark">{t(step.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{t(step.bodyKey)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
