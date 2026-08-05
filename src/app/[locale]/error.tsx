'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module')
  );
}

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    const key = 'ingoboka:chunk-reload';
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    window.location.reload();
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('title')}</h1>
        <Alert variant="error">{error.message || t('message')}</Alert>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="pill"
            onClick={() => {
              if (isChunkLoadError(error)) {
                window.location.reload();
                return;
              }
              reset();
            }}
          >
            {t('retry')}
          </Button>
          <Link href="/">
            <Button variant="outline">{t('goHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
