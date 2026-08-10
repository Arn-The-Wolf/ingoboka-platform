'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import {
  useClearReadNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/use-notifications';
import { getNotificationActionHref } from '@/lib/api/notifications';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UserNotification } from '@/lib/api/notifications';

const DEFAULT_PAGE_SIZE = 10;

export default function NotificationsPage() {
  const t = useTranslations('citizen.notifications');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useNotifications(page, pageSize);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearReadMutation = useClearReadNotifications();

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const readCount = notifications.filter((n) => n.readAt).length;
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? notifications.length;
  const selected = notifications.find((item) => item.id === selectedId) ?? null;

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
    setSelectedId(null);
  };

  const openNotification = (item: UserNotification) => {
    setSelectedId(item.id);
    if (!item.readAt) {
      markReadMutation.mutate(item.id);
    }
  };

  const goToAction = (item: UserNotification) => {
    const href = getNotificationActionHref(item);
    if (!item.readAt) {
      markReadMutation.mutate(item.id);
    }
    if (href) {
      router.push(href);
    }
  };

  return (
    <>
      <CitizenHeader title={t('title')} subtitle={t('subtitle')} />
      <PageContainer>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {unreadCount > 0 ? (
            <p className="text-sm text-brand-muted">{t('unreadCount', { count: unreadCount })}</p>
          ) : (
            <p className="text-sm text-brand-muted">{t('allCaughtUp')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              loading={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              {t('markAllRead')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={readCount === 0 || clearReadMutation.isPending}
              loading={clearReadMutation.isPending}
              onClick={() => clearReadMutation.mutate()}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {t('clearRead')}
            </Button>
          </div>
        </div>

        {isLoading && <ListSkeleton rows={5} />}

        {error && !isLoading && (
          <Alert variant="error" className="mb-4">
            {t('loadError')}
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            {notifications.map((item) => {
              const isUnread = !item.readAt;
              const isSelected = selectedId === item.id;
              return (
                <Card
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNotification(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openNotification(item);
                    }
                  }}
                  className={cn(
                    'cursor-pointer border-brand-border/60 transition-shadow hover:shadow-card',
                    isUnread && 'border-brand-primary/30 bg-brand-primary-light/20',
                    isSelected && 'ring-2 ring-brand-primary/40'
                  )}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        isUnread ? 'bg-brand-primary text-white' : 'bg-brand-surface-container'
                      )}
                    >
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-brand-primary-dark">{item.subject}</p>
                        {(item.priority ?? 0) >= 1 && (
                          <Badge variant="pending">{t('urgent')}</Badge>
                        )}
                        <Badge variant={isUnread ? 'pending' : 'active'}>
                          {isUnread ? t('unread') : t('read')}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-brand-muted">{item.body}</p>
                      <p className="mt-2 text-xs text-brand-muted">{formatDate(item.createdAt)}</p>
                    </div>
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        loading={markReadMutation.isPending && markReadMutation.variables === item.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          markReadMutation.mutate(item.id);
                        }}
                        aria-label={t('markRead')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card className="sticky top-24 border-brand-border/60">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-brand-primary-dark">{selected.subject}</h2>
                    {(selected.priority ?? 0) >= 1 && <Badge variant="pending">{t('urgent')}</Badge>}
                  </div>
                  <p className="text-sm text-brand-muted">{formatDate(selected.createdAt)}</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-primary-dark">
                    {selected.body}
                  </p>
                  {getNotificationActionHref(selected) && (
                    <Button variant="pill" onClick={() => goToAction(selected)}>
                      {t('viewClaimUpdate')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-brand-muted">
                  {t('selectForDetails')}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {!isLoading && !error && notifications.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-brand-muted">
              {t('empty')}
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <InsurerPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              setSelectedId(null);
            }}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {error && (
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            {tCommon('retry')}
          </Button>
        )}
      </PageContainer>
    </>
  );
}
