'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={cn('flex gap-1 rounded-lg border border-brand-border p-1', className)}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium uppercase transition-colors',
            locale === loc
              ? 'bg-brand-primary text-white'
              : 'text-brand-muted hover:text-brand-primary-dark'
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
