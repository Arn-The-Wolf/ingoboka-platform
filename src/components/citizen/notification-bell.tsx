'use client';

import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useNotificationSummary } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const t = useTranslations('citizen.notifications');
  const { data: summary } = useNotificationSummary();
  const unreadCount = summary?.unreadCount ?? 0;

  return (
    <Link
      href="/notifications"
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-brand-primary transition-colors hover:bg-brand-primary-light',
        className
      )}
      aria-label={
        unreadCount > 0 ? t('bellUnread', { count: unreadCount }) : t('nav')
      }
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-error px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
