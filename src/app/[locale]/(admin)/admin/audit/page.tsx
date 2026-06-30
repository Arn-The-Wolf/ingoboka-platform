'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';

export default function AdminAuditPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.listAuditLog(),
    retry: false,
  });

  const entries = data?.content ?? [];

  return (
    <PageContainer>
      <PageHeader title={t('audit')} subtitle={t('noAuditHint')} />

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-brand-border/60 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border bg-brand-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">
                  {t('timestamp')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">
                  {t('action')}
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-brand-primary-dark md:table-cell">
                  {t('actor')}
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-brand-primary-dark lg:table-cell">
                  {t('resource')}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-brand-border/40 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-brand-muted">
                    {formatDate(entry.occurredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-primary-dark">{entry.action}</p>
                    {entry.details && (
                      <p className="text-xs text-brand-muted">{entry.details}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-brand-muted md:table-cell">{entry.actor}</td>
                  <td className="hidden px-4 py-3 text-brand-muted lg:table-cell">{entry.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{t('noAudit')}</p>
            <p className="mt-1 text-sm text-brand-muted">{t('noAuditHint')}</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
