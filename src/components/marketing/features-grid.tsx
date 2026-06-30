'use client';

import {
  BookOpen,
  Users,
  Smartphone,
  FileCheck,
  Wallet,
  HeadphonesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: BookOpen, titleKey: 'features.understandCover.title' as const, bodyKey: 'features.understandCover.body' as const },
  { icon: Users, titleKey: 'features.protectFamily.title' as const, bodyKey: 'features.protectFamily.body' as const },
  { icon: Smartphone, titleKey: 'features.mobileMoney.title' as const, bodyKey: 'features.mobileMoney.body' as const },
  { icon: FileCheck, titleKey: 'features.easyClaims.title' as const, bodyKey: 'features.easyClaims.body' as const },
  { icon: Wallet, titleKey: 'features.digitalWallet.title' as const, bodyKey: 'features.digitalWallet.body' as const },
  { icon: HeadphonesIcon, titleKey: 'features.localSupport.title' as const, bodyKey: 'features.localSupport.body' as const },
];

export function FeaturesGrid() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('features.title')} subtitle={t('features.subtitle')} />
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map(({ icon: Icon, titleKey, bodyKey }, index) => (
            <AnimatedSection key={titleKey} delay={index * 60}>
              <article
                className={cn(
                  'group flex h-full flex-col gap-4 rounded-2xl border border-brand-border/60 bg-white p-6',
                  'interactive-card'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-light transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-primary group-hover:shadow-elevated">
                  <Icon className="h-6 w-6 text-brand-primary transition-colors group-hover:text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark">{t(titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{t(bodyKey)}</p>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
