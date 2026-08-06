'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DisplayCurrency } from '@/lib/fx/rates';

interface CurrencyToggleProps {
  currency: DisplayCurrency;
  onChange: (currency: DisplayCurrency) => void;
  fxSource?: 'live' | 'fallback';
  className?: string;
}

export function CurrencyToggle({ currency, onChange, fxSource, className }: CurrencyToggleProps) {
  const t = useTranslations('insurer');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-brand-muted">{t('displayCurrency')}</span>
      <div className="inline-flex rounded-full border border-brand-border/60 bg-white p-0.5 shadow-sm">
        {(['RWF', 'USD'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              currency === code
                ? 'bg-brand-primary text-white'
                : 'text-brand-muted hover:text-brand-primary-dark'
            )}
          >
            {code}
          </button>
        ))}
      </div>
      {fxSource === 'fallback' && (
        <span className="text-xs text-brand-warning">{t('fxFallback')}</span>
      )}
    </div>
  );
}
