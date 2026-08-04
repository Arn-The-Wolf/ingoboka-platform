import { LandingHero } from '@/components/landing/landing-hero';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingTrust } from '@/components/landing/landing-trust';
import { LiveProductsCatalog } from '@/components/landing/live-products-catalog';
import { PartnersStrip } from '@/components/landing/partners-strip';
import { TestimonialsCarousel } from '@/components/landing/testimonials-carousel';
import { HomeHighlights } from '@/components/marketing/home-highlights';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <LandingHero />
      <PartnersStrip />
      <HomeHighlights />
      <LiveProductsCatalog />
      <TestimonialsCarousel />
      <LandingTrust />
      <LandingCta />
    </div>
  );
}
