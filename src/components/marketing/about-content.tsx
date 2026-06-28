'use client';

import { Heart, Target, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/landing/section-heading';

const VALUES = [
  { icon: Heart, titleKey: 'about.values.clarity.title' as const, bodyKey: 'about.values.clarity.body' as const },
  { icon: Target, titleKey: 'about.values.access.title' as const, bodyKey: 'about.values.access.body' as const },
  { icon: MapPin, titleKey: 'about.values.community.title' as const, bodyKey: 'about.values.community.body' as const },
];

export function AboutContent() {
  const t = useTranslations('landing');

  return (
    <div className="space-y-16 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <article className="rounded-2xl border border-brand-border/60 bg-white p-8 shadow-card">
            <h2 className="mb-3 text-xl font-bold text-brand-primary">{t('about.mission.title')}</h2>
            <p className="text-sm leading-relaxed text-brand-muted">{t('about.mission.body')}</p>
          </article>
          <article className="rounded-2xl border border-brand-border/60 bg-white p-8 shadow-card">
            <h2 className="mb-3 text-xl font-bold text-brand-primary">{t('about.vision.title')}</h2>
            <p className="text-sm leading-relaxed text-brand-muted">{t('about.vision.body')}</p>
          </article>
        </div>
      </div>

      <div className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading title={t('about.rwanda.title')} subtitle={t('about.rwanda.body')} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeading title={t('about.values.title')} subtitle={t('about.values.subtitle')} />
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article
              key={titleKey}
              className="rounded-2xl border border-brand-border/60 bg-brand-background p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
                <Icon className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-brand-primary-dark">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{t(bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
