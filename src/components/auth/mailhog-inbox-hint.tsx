'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/components/ui/alert';
import { isLocalDevApi, MAILHOG_INBOX_URL } from '@/lib/auth/dev-mail';

export function MailhogInboxHint() {
  const t = useTranslations('auth');

  if (!isLocalDevApi()) {
    return null;
  }

  return (
    <Alert variant="default">
      {t('mailhogHint')}{' '}
      <a
        href={MAILHOG_INBOX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand-primary underline"
      >
        {MAILHOG_INBOX_URL}
      </a>
    </Alert>
  );
}
