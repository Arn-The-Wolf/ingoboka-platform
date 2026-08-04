import type { ProductSummary } from '@/lib/api/products';

const FALLBACK_BY_SLUG: Record<string, string> = {
  accident: '/images/products/personal-accident.svg',
  personal: '/images/products/personal-accident.svg',
  health: '/images/products/family-health.svg',
  family: '/images/products/family-health.svg',
  funeral: '/images/products/funeral-cover.svg',
  life: '/images/products/funeral-cover.svg',
  motor: '/images/products/motor-insurance.webp',
  business: '/images/products/business-insurance.webp',
  education: '/images/products/education-insurance.webp',
  agriculture: '/images/products/agriculture-insurance.webp',
};

/** 
 * Get product hero image, preferring local assets over external URLs.
 * Falls back to category-based images if backend doesn't provide one.
 */
export function getProductHeroImage(product: Pick<ProductSummary, 'heroImageUrl' | 'category' | 'name' | 'code'>): string {
  // Only use backend URL if it's a local/relative path or from our configured domains
  if (product.heroImageUrl?.trim()) {
    const url = product.heroImageUrl.trim();
    // Accept relative paths or localhost URLs, but skip external URLs like Unsplash
    // since they may not exist or cause CORS issues
    if (url.startsWith('/') || url.startsWith('http://localhost') || url.includes('185.181.10.165') || url.includes('4.168.192.169')) {
      return url;
    }
  }

  // Fallback to local images based on product category/name/code
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
