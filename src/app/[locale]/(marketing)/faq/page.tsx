import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/landing/section-heading';
import { MarketingFaqAccordion } from '@/components/marketing/marketing-faq-accordion';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function FaqPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.faq.heroTitle')} subtitle={t('pages.faq.heroSubtitle')} />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <SectionHeading title={t('faq.title')} subtitle={t('faq.subtitle')} />
          <MarketingFaqAccordion />
        </div>
      </section>
      <LandingCta />
    </>
  );
}
