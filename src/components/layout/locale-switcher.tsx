'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale === locale) return;

    startTransition(() => {
      // Updates the URL prefix and NEXT_LOCALE cookie via next-intl middleware
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div
      className={cn(
        'flex gap-1 rounded-lg border border-brand-border p-1',
        isPending && 'opacity-70',
        className
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending}
          onClick={() => switchLocale(loc)}
          aria-pressed={locale === loc}
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
