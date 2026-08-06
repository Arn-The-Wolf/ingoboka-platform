/**
 * Partner / insurer logo sources.
 *
 * Prefer publicly hosted official marks (Wikimedia Commons, site icons via
 * Google's favicon CDN). Clearbit's free logo API shut down Dec 2025, so we
 * no longer depend on logo.clearbit.com. Every entry has a local wordmark /
 * icon fallback so the UI never shows a broken image.
 */

export type BrandLogoDef = {
  name: string;
  /** Preferred remote or local logo URL(s) tried in order via BrandLogo. */
  src: string;
  /** Guaranteed local asset (wordmark SVG or hosted icon). */
  fallbackSrc: string;
  domain?: string;
};

/** Google high-res site icon (real favicon from the company's domain). */
export function googleLogo(domain: string, size = 128) {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=${size}`;
}

/** Wikimedia Commons thumbnail of an official SVG/PNG mark. */
export function wikimediaThumb(path: string, width = 320) {
  // path like "2/2a/MTN_2022_logo.svg"
  const file = path.split('/').pop()!;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width}px-${file}.png`;
}

export const PARTNER_LOGOS: BrandLogoDef[] = [
  {
    name: 'Airtel Money',
    // Official Airtel wordmark (Wikimedia Commons), hosted locally.
    src: '/images/partners/airtel.svg',
    fallbackSrc: '/images/partners/wordmarks/airtel.svg',
    domain: 'airtel.africa',
  },
  {
    name: 'RISA',
    src: '/images/partners/risa-icon.png',
    fallbackSrc: '/images/partners/wordmarks/risa.svg',
    domain: 'risa.gov.rw',
  },
  {
    name: 'Licensed insurers',
    src: '/images/partners/wordmarks/insurers.svg',
    fallbackSrc: '/images/partners/wordmarks/insurers.svg',
  },
  {
    name: 'MTN MoMo',
    // Official MTN 2022 wordmark (Wikimedia Commons), with local wordmark fallback.
    src: wikimediaThumb('2/2a/MTN_2022_logo.svg', 320),
    fallbackSrc: '/images/partners/wordmarks/mtn.svg',
    domain: 'mtn.com',
  },
];
export const INSURER_LOGOS: BrandLogoDef[] = [
  {
    name: 'Radiant Insurance',
    domain: 'radiant.rw',
    src: '/images/insurers/radiant.png',
    fallbackSrc: '/images/insurers/wordmarks/radiant.svg',
  },
  {
    name: 'Prime Insurance',
    domain: 'prime.rw',
    src: '/images/insurers/wordmarks/prime.svg',
    fallbackSrc: '/images/insurers/wordmarks/prime.svg',
  },
  {
    name: 'Sanlam',
    domain: 'sanlam.com',
    // Prefer typographic wordmark — Google favicon for sanlam.com is not the brand mark.
    src: '/images/insurers/wordmarks/sanlam.svg',
    fallbackSrc: '/images/insurers/wordmarks/sanlam.svg',
  },
  {
    name: 'Sonarwa',
    domain: 'sonarwa.co.rw',
    src: '/images/insurers/sonarwa.png',
    fallbackSrc: '/images/insurers/wordmarks/sonarwa.svg',
  },
  {
    name: 'BK Insurance',
    domain: 'bkinsurance.rw',
    src: '/images/insurers/bk.png',
    fallbackSrc: '/images/insurers/wordmarks/bk.svg',
  },
  {
    name: 'Britam',
    domain: 'britam.com',
    src: '/images/insurers/wordmarks/britam.svg',
    fallbackSrc: '/images/insurers/wordmarks/britam.svg',
  },
  {
    name: 'Old Mutual',
    domain: 'oldmutual.com',
    src: '/images/insurers/oldmutual-horse.png',
    fallbackSrc: '/images/insurers/wordmarks/oldmutual.svg',
  },
  {
    name: 'MUA',
    domain: 'mua.mu',
    src: '/images/insurers/wordmarks/mua.svg',
    fallbackSrc: '/images/insurers/wordmarks/mua.svg',
  },
  {
    name: 'RSSB',
    domain: 'rssb.rw',
    src: '/images/insurers/rssb.png',
    fallbackSrc: '/images/insurers/wordmarks/rssb.svg',
  },
];
