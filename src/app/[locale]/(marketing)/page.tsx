import { LandingHero } from '@/components/landing/landing-hero';
import { LandingCta } from '@/components/landing/landing-cta';
import { HomeHighlights } from '@/components/marketing/home-highlights';

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <HomeHighlights />
      <LandingCta />
    </>
  );
}
