'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchUsdToRwfRate,
  formatDisplayAmount,
  type DisplayCurrency,
  type FxRateResult,
} from '@/lib/fx/rates';

const STORAGE_KEY = 'ingoboka-display-currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<DisplayCurrency>('RWF');
  const [fx, setFx] = useState<FxRateResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'USD' || stored === 'RWF') {
      setCurrencyState(stored);
    }
    fetchUsdToRwfRate()
      .then(setFx)
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const format = useCallback(
    (amountRwf: number) => {
      const rate = fx?.rate ?? 1300;
      return formatDisplayAmount(amountRwf, currency, rate);
    },
    [currency, fx?.rate]
  );

  return {
    currency,
    setCurrency,
    fx,
    loading,
    format,
  };
}
