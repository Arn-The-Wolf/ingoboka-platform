const FALLBACK_USD_RWF = 1300;

export type DisplayCurrency = 'RWF' | 'USD';

export interface FxRateResult {
  rate: number;
  source: 'live' | 'fallback';
  fetchedAt: string;
}

let cachedRate: FxRateResult | null = null;
let cacheExpiry = 0;

export async function fetchUsdToRwfRate(): Promise<FxRateResult> {
  const now = Date.now();
  if (cachedRate && now < cacheExpiry) {
    return cachedRate;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('FX API unavailable');
    const json = (await res.json()) as { rates?: Record<string, number> };
    const rate = json.rates?.RWF;
    if (!rate || rate <= 0) throw new Error('Invalid RWF rate');

    cachedRate = {
      rate,
      source: 'live',
      fetchedAt: new Date().toISOString(),
    };
    cacheExpiry = now + 60 * 60 * 1000;
    return cachedRate;
  } catch {
    cachedRate = {
      rate: FALLBACK_USD_RWF,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
    };
    cacheExpiry = now + 5 * 60 * 1000;
    return cachedRate;
  }
}

export function convertAmount(
  amountRwf: number,
  currency: DisplayCurrency,
  usdToRwf: number
): number {
  if (currency === 'RWF') return amountRwf;
  return amountRwf / usdToRwf;
}

export function formatDisplayAmount(
  amountRwf: number,
  currency: DisplayCurrency,
  usdToRwf: number
): string {
  const value = convertAmount(amountRwf, currency, usdToRwf);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(value);
}
