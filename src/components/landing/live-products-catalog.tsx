'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, HeartPulse, Shield, Flower2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LoadingLink } from '@/components/navigation/loading-link';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeading } from '@/components/landing/section-heading';
import { fetchPublicProducts } from '@/lib/api/public-products';
import type { ProductSummary } from '@/lib/api/products';
import { getProductHeroImage } from '@/lib/product-images';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATIC_FALLBACK: Array<{
  key: 'personalAccident' | 'familyHealth' | 'funeralCover';
  icon: typeof Shield;
  accent: string;
  popular?: boolean;
}> = [
  { key: 'personalAccident', icon: Shield, accent: 'bg-brand-primary-light text-brand-primary' },
  {
    key: 'familyHealth',
    icon: HeartPulse,
    accent: 'bg-brand-accent/20 text-brand-secondary',
    popular: true,
  },
  { key: 'funeralCover', icon: Flower2, accent: 'bg-brand-surface-container text-brand-outline' },
];

function ProductPlanCard({
  product,
  popular,
  enrollLabel,
  mostPopularLabel,
  useRegisterCta,
  t,
}: {
  product: ProductSummary;
  popular?: boolean;
  enrollLabel: string;
  mostPopularLabel: string;
  useRegisterCta: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const heroSrc = getProductHeroImage(product);
  const href = useRegisterCta ? '/register' : `/products/${product.id}`;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-background shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated',
        popular && 'border-brand-primary/40 ring-1 ring-brand-primary/10'
      )}
    >
      {popular && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-brand-accent px-3 py-0.5 text-xs font-bold text-brand-primary-dark shadow-sm animate-pulse">
          {mostPopularLabel}
        </span>
      )}
      <div className="relative h-36 w-full overflow-hidden bg-brand-primary-light/40">
        <Image
          src={heroSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 85vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark leading-tight transition-colors group-hover:text-brand-primary line-clamp-2">{product.name}</h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-brand-muted line-clamp-3">
          {product.description ?? ''}
        </p>
        {product.startingPremium != null && (
          <p className="mb-4 text-sm font-bold text-brand-primary">
            {t('products.fromPrice', { price: formatCurrency(product.startingPremium) })}
          </p>
        )}
        <LoadingLink href={href}>
          <Button
            variant="outline"
            className="w-full gap-2 rounded-full transition-all duration-300 group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-lg"
          >
            {enrollLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </LoadingLink>
      </div>
    </article>
  );
}

function StaticFallbackCard({
  keyName,
  icon: Icon,
  accent,
  popular,
  t,
}: {
  keyName: (typeof STATIC_FALLBACK)[number]['key'];
  icon: (typeof STATIC_FALLBACK)[number]['icon'];
  accent: string;
  popular?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const imageMap = {
    personalAccident: '/images/products/personal-accident.svg',
    familyHealth: '/images/products/family-health.svg',
    funeralCover: '/images/products/funeral-cover.svg',
  } as const;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-background shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated',
        popular && 'border-brand-primary/40 ring-1 ring-brand-primary/10'
      )}
    >
      {popular && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-brand-accent px-3 py-0.5 text-xs font-bold text-brand-primary-dark shadow-sm animate-pulse">
          {t('products.mostPopular')}
        </span>
      )}
      <div className="relative h-36 w-full overflow-hidden">
        <Image src={imageMap[keyName]} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="33vw" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6', accent)}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-brand-primary-dark leading-tight transition-colors group-hover:text-brand-primary line-clamp-2">
          {t(`products.${keyName}.name`)}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-brand-muted line-clamp-3">
          {t(`products.${keyName}.description`)}
        </p>
        <p className="mb-4 text-sm font-bold text-brand-primary">
          {t('products.fromPrice', { price: t(`products.${keyName}.price`) })}
        </p>
        <LoadingLink href="/register">
          <Button variant="outline" className="w-full gap-2 rounded-full transition-all duration-300 group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-lg">
            {t('products.enrollCta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </LoadingLink>
      </div>
    </article>
  );
}

interface LiveProductsCatalogProps {
  /** Marketing pages link to register; citizen catalog uses product detail */
  useRegisterCta?: boolean;
  className?: string;
}

export function LiveProductsCatalog({ useRegisterCta = true, className }: LiveProductsCatalogProps) {
  const t = useTranslations('landing');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['marketing', 'products', 'public'],
    queryFn: () => fetchPublicProducts(),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.content?.filter((p) => p.status !== 'DRAFT') ?? [];

  const cards =
    !isError && products.length > 0
      ? products.map((product, index) => (
          <ProductPlanCard
            key={product.id}
            product={product}
            popular={index === 1}
            enrollLabel={useRegisterCta ? t('products.enrollCta') : t('home.highlights.viewPlans')}
            mostPopularLabel={t('products.mostPopular')}
            useRegisterCta={useRegisterCta}
            t={t}
          />
        ))
      : STATIC_FALLBACK.map(({ key, icon, accent, popular }) => (
          <StaticFallbackCard key={key} keyName={key} icon={icon} accent={accent} popular={popular} t={t} />
        ));

  return (
    <section className={cn('bg-white py-16 lg:py-24', className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('products.title')} subtitle={t('products.subtitle')} />
        </AnimatedSection>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" shimmer />
            <Skeleton className="h-80 rounded-2xl" shimmer />
            <Skeleton className="h-80 rounded-2xl" shimmer />
          </div>
        ) : (
          <AnimatedSection delay={100}>
            <div className="md:hidden">
              <Carousel ariaLabel={t('products.title')}>{cards}</Carousel>
            </div>
            <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-8">{cards}</div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
