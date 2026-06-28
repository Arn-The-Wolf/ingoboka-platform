import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { AboutContent } from '@/components/marketing/about-content';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function AboutPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.about.heroTitle')} subtitle={t('pages.about.heroSubtitle')} />
      <AboutContent />
      <LandingCta />
    </>
  );
}
