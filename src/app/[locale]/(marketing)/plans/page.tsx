import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { LandingProducts } from '@/components/landing/landing-products';
import { LandingCta } from '@/components/landing/landing-cta';

export default async function PlansPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.plans.heroTitle')} subtitle={t('pages.plans.heroSubtitle')} />
      <LandingProducts />
      <LandingCta />
    </>
  );
}
