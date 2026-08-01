'use client';

import { Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Carousel } from '@/components/ui/carousel';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const TESTIMONIAL_KEYS = ['1', '2', '3'] as const;

const TESTIMONIAL_IMAGES = [
  '/images/testimonials/professional-woman.webp',
  '/images/testimonials/business-owner.webp',
  '/images/testimonials/parent-family.webp',
] as const;

export function TestimonialsCarousel() {
  const t = useTranslations('landing.testimonials');

  return (
    <section className="bg-brand-primary-light/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <div className="md:hidden">
            <Carousel ariaLabel={t('title')}>
              {TESTIMONIAL_KEYS.map((key, index) => (
                <TestimonialCard
                  key={key}
                  quote={t(`quote${key}`)}
                  author={t(`author${key}`)}
                  role={t(`role${key}`)}
                  image={TESTIMONIAL_IMAGES[index]}
                />
              ))}
            </Carousel>
          </div>

          <div className="hidden gap-6 md:grid md:grid-cols-3">
            {TESTIMONIAL_KEYS.map((key, index) => (
              <div key={key} className={cn('animate-fade-in-up', `stagger-${index + 1}`)}>
                <TestimonialCard
                  quote={t(`quote${key}`)}
                  author={t(`author${key}`)}
                  role={t(`role${key}`)}
                  image={TESTIMONIAL_IMAGES[index]}
                />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  image,
}: {
  quote: string;
  author: string;
  role: string;
  image: string;
}) {
  return (
    <article className="interactive-card flex h-full flex-col rounded-2xl border border-brand-border/60 bg-white p-6 shadow-card">
      <Quote className="mb-4 h-8 w-8 text-brand-accent" />
      <p className="mb-6 flex-1 text-sm leading-relaxed text-brand-muted">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <img 
          src={image} 
          alt={author}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-primary-light"
        />
        <div>
          <p className="font-semibold text-brand-primary-dark">{author}</p>
          <p className="text-xs text-brand-outline">{role}</p>
        </div>
      </div>
    </article>
  );
}
