import type { ProductSummary } from '@/lib/api/products';

const FALLBACK_BY_SLUG: Record<string, string> = {
  accident: '/images/products/personal-accident.svg',
  personal: '/images/products/personal-accident.svg',
  health: '/images/products/family-health.svg',
  family: '/images/products/family-health.svg',
  funeral: '/images/products/funeral-cover.svg',
  life: '/images/products/funeral-cover.svg',
};

/** Local hero when MinIO/API returns no heroImageUrl (until Rodin seeds product media). */
export function getProductHeroImage(product: Pick<ProductSummary, 'heroImageUrl' | 'category' | 'name' | 'code'>): string {
  if (product.heroImageUrl?.trim()) {
    return product.heroImageUrl;
  }

  const haystack = [product.category, product.code, product.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [keyword, src] of Object.entries(FALLBACK_BY_SLUG)) {
    if (haystack.includes(keyword)) {
      return src;
    }
  }

  return '/images/products/default-insurance.svg';
}
