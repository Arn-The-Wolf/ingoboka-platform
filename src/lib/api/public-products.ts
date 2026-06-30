import type { ProductSummary } from './products';

function mapPublicProduct(raw: Record<string, unknown>): ProductSummary {
  const plans = Array.isArray(raw.plans) ? raw.plans : [];
  const premiums = plans
    .map((p) => Number((p as Record<string, unknown>).premiumAmount))
    .filter((n) => !Number.isNaN(n) && n > 0);

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'Insurance product'),
    category: String(raw.category ?? raw.productCategory ?? 'GENERAL'),
    description: raw.description ? String(raw.description) : undefined,
    startingPremium: premiums.length ? Math.min(...premiums) : Number(raw.startingPremium ?? 0) || undefined,
    currency: String(raw.currency ?? 'RWF'),
    status: String(raw.status ?? 'PUBLISHED'),
    code: raw.code ? String(raw.code) : undefined,
    heroImageUrl: raw.heroImageUrl ? String(raw.heroImageUrl) : undefined,
  };
}

/** Anonymous marketing catalog via Next.js server proxy. */
export async function fetchPublicProducts(): Promise<{
  content: ProductSummary[];
  totalElements: number;
}> {
  const res = await fetch('/api/public/products', { cache: 'no-store' });
  if (!res.ok) {
    return { content: [], totalElements: 0 };
  }
  const data = (await res.json()) as { content?: Record<string, unknown>[]; totalElements?: number };
  const content = (data.content ?? []).map((p) => mapPublicProduct(p));
  return { content, totalElements: data.totalElements ?? content.length };
}
