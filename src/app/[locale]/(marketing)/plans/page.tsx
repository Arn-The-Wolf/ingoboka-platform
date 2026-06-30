import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { LiveProductsCatalog } from '@/components/landing/live-products-catalog';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function PlansPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.plans.heroTitle')} subtitle={t('pages.plans.heroSubtitle')} />
      <LiveProductsCatalog />
      <LandingCta />
    </>
  );
}
