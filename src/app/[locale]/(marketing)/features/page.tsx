import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { LandingTrust } from '@/components/landing/landing-trust';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function FeaturesPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.features.heroTitle')} subtitle={t('pages.features.heroSubtitle')} />
      <FeaturesGrid />
      <LandingTrust />
      <LandingCta />
    </>
  );
}
