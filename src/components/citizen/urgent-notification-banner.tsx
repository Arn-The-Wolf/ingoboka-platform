'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useMarkNotificationRead, useUrgentNotifications } from '@/hooks/use-notifications';
import { getNotificationActionHref } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';

interface UrgentNotificationBannerProps {
  className?: string;
}

/** Top-bar urgent alerts for unread claim updates — dismissible when read/acted. */
export function UrgentNotificationBanner({ className }: UrgentNotificationBannerProps) {
  const t = useTranslations('citizen.notifications');
  const { data: urgent = [] } = useUrgentNotifications();
  const markRead = useMarkNotificationRead();

  const current = urgent[0];

  const handleDismiss = useCallback(
    (id: string) => {
      markRead.mutate(id);
    },
    [markRead]
  );

  if (!current) return null;

  const actionHref = getNotificationActionHref(current);

  return (
    <div
      className={cn(
        'relative shrink-0 border-b border-amber-300/80 bg-amber-50',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label={t('urgentBannerLabel')}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 lg:px-6">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-950">{current.subject}</p>
          <p className="mt-0.5 text-sm text-amber-900/90">{current.body}</p>
          {actionHref && (
            <Link
              href={actionHref}
              className="mt-2 inline-flex text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
              onClick={() => handleDismiss(current.id)}
            >
              {t('viewClaimUpdate')}
            </Link>
          )}
        </div>
        {urgent.length > 1 && (
          <span className="hidden shrink-0 rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-medium text-amber-950 sm:inline">
            {t('moreUrgent', { count: urgent.length - 1 })}
          </span>
        )}
        <button
          type="button"
          onClick={() => handleDismiss(current.id)}
          className="shrink-0 rounded-full p-1 text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-950"
          aria-label={t('dismissUrgent')}
          disabled={markRead.isPending}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
