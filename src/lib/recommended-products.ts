const STORAGE_KEY = 'ingoboka-recommended-products';

export function setRecommendedProductIds(ids: string[]) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getRecommendedProductIds(): Set<string> {
  if (typeof sessionStorage === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(ids.filter(Boolean));
  } catch {
    return new Set();
  }
}

export function clearRecommendedProductIds() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
