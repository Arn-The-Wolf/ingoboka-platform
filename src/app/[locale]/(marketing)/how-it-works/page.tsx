import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { HowItWorksTimeline } from '@/components/marketing/how-it-works-timeline';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function HowItWorksPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.howItWorks.heroTitle')} subtitle={t('pages.howItWorks.heroSubtitle')} />
      <HowItWorksTimeline />
      <LandingCta />
    </>
  );
}
