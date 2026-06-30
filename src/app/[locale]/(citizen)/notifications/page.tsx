'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Bell, Check } from 'lucide-react';
import { notificationApi } from '@/lib/api/notifications';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const t = useTranslations('citizen.notifications');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: () => notificationApi.listMine(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] }),
  });

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <CitizenHeader title={t('title')} subtitle={t('subtitle')} />
      <PageContainer>
        {unreadCount > 0 && (
          <p className="mb-4 text-sm text-brand-muted">
            {t('unreadCount', { count: unreadCount })}
          </p>
        )}

        {isLoading && <ListSkeleton rows={5} />}

        {error && !isLoading && (
          <Alert variant="error" className="mb-4">
            {t('loadError')}
          </Alert>
        )}

        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.readAt;
            return (
              <Card
                key={item.id}
                className={cn(
                  'border-brand-border/60 transition-shadow hover:shadow-card',
                  isUnread && 'border-brand-primary/30 bg-brand-primary-light/20'
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
                      <Badge variant={isUnread ? 'pending' : 'active'}>
                        {isUnread ? t('unread') : t('read')}
                      </Badge>
                    </div>
                    <p className="text-sm text-brand-muted">{item.body}</p>
                    <p className="mt-2 text-xs text-brand-muted">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      loading={markReadMutation.isPending && markReadMutation.variables === item.id}
                      onClick={() => markReadMutation.mutate(item.id)}
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

        {!isLoading && !error && notifications.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-brand-muted">
              {t('empty')}
            </CardContent>
          </Card>
        )}

        {error && (
          <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] })}>
            {tCommon('retry')}
          </Button>
        )}
      </PageContainer>
    </>
  );
}
