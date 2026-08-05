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

const UNSPLASH_PARAMS = 'auto=format&fit=crop&w=800&q=70';

/**
 * Royalty-free Unsplash imagery keyed by insurance service keyword.
 * These are referenced by URL (see next.config.js remotePatterns) — no binaries in-repo —
 * and always degrade to a local SVG via <ImageWithFallback> if a URL fails.
 */
const UNSPLASH_BY_KEYWORD: Record<string, string> = {
  moto: `https://images.unsplash.com/photo-1558981285-6f0c94958bb6?${UNSPLASH_PARAMS}`,
  motor: `https://images.unsplash.com/photo-1558981285-6f0c94958bb6?${UNSPLASH_PARAMS}`,
  accident: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${UNSPLASH_PARAMS}`,
  personal: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${UNSPLASH_PARAMS}`,
  health: `https://images.unsplash.com/photo-1584515933487-779824d29309?${UNSPLASH_PARAMS}`,
  family: `https://images.unsplash.com/photo-1511895426328-dc8714191300?${UNSPLASH_PARAMS}`,
  crop: `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?${UNSPLASH_PARAMS}`,
  agri: `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?${UNSPLASH_PARAMS}`,
  livestock: `https://images.unsplash.com/photo-1500595046743-cd271d694d30?${UNSPLASH_PARAMS}`,
  cattle: `https://images.unsplash.com/photo-1500595046743-cd271d694d30?${UNSPLASH_PARAMS}`,
  funeral: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?${UNSPLASH_PARAMS}`,
  life: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?${UNSPLASH_PARAMS}`,
};

const DEFAULT_UNSPLASH = `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?${UNSPLASH_PARAMS}`;

function haystackFor(
  product: Pick<ProductSummary, 'category' | 'name' | 'code'>
): string {
  return [product.category, product.code, product.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Local hero (SVG) used as the guaranteed fallback when remote media is unavailable. */
export function getProductHeroImage(
  product: Pick<ProductSummary, 'heroImageUrl' | 'category' | 'name' | 'code'>
): string {
  if (product.heroImageUrl?.trim()) {
    const url = product.heroImageUrl.trim();
    // Accept relative paths or localhost URLs, but skip external URLs like Unsplash
    // since they may not exist or cause CORS issues
    if (url.startsWith('/') || url.startsWith('http://localhost') || url.includes('185.181.10.165') || url.includes('4.168.192.169')) {
      return url;
    }
  }

  const haystack = haystackFor(product);
  for (const [keyword, src] of Object.entries(FALLBACK_BY_SLUG)) {
    if (haystack.includes(keyword)) {
      return src;
    }
  }

  return '/images/products/default-insurance.svg';
}

/** Local SVG fallback only (never a remote URL). */
export function getProductLocalFallback(
  product: Pick<ProductSummary, 'category' | 'name' | 'code'>
): string {
  const haystack = haystackFor(product);
  for (const [keyword, src] of Object.entries(FALLBACK_BY_SLUG)) {
    if (haystack.includes(keyword)) {
      return src;
    }
  }
  return '/images/products/default-insurance.svg';
}

/**
 * Preferred product artwork: API-provided media first, otherwise a topical
 * royalty-free Unsplash image chosen from the product name/category. Pair with
 * {@link getProductLocalFallback} in <ImageWithFallback> for graceful degradation.
 */
export function getProductRemoteHero(
  product: Pick<ProductSummary, 'heroImageUrl' | 'category' | 'name' | 'code'>
): string {
  if (product.heroImageUrl?.trim()) {
    return product.heroImageUrl;
  }

  const haystack = haystackFor(product);
  for (const [keyword, src] of Object.entries(UNSPLASH_BY_KEYWORD)) {
    if (haystack.includes(keyword)) {
      return src;
    }
  }

  return DEFAULT_UNSPLASH;
}

/** Topical Unsplash image for a fixed marketing keyword (static fallback cards). */
export function getUnsplashByKeyword(keyword: string): string {
  return UNSPLASH_BY_KEYWORD[keyword] ?? DEFAULT_UNSPLASH;
}
