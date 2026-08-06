'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ClipboardList } from 'lucide-react';
import { agentPortalApi } from '@/lib/api';
import {
  DEFAULT_LIST_FILTERS,
  InsurerListToolbar,
  type ListToolbarFilters,
} from '@/components/insurer/insurer-list-toolbar';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { applicationStatusTone, insurerStatusLabel } from '@/lib/insurer-status';
import { formatCurrency } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 10;

export default function AgentApplicationsPage() {
  const t = useTranslations('agent');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ListToolbarFilters>({
    ...DEFAULT_LIST_FILTERS,
    sortBy: 'submittedAt',
  });

  const queryFilters = useMemo(
    () => ({
      page,
      size: pageSize,
      status: filters.status || undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    }),
    [page, pageSize, filters]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent', 'applications', queryFilters],
    queryFn: () => agentPortalApi.listApplications(queryFilters),
  });

  const applications = data?.content ?? [];

  const handleFilterChange = (patch: Partial<ListToolbarFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('applications')}
        subtitle={t('totalApplications', { count: data?.totalElements ?? 0 })}
      />

      <InsurerListToolbar
        filters={filters}
        onChange={handleFilterChange}
        searchPlaceholder={t('searchApplications')}
        statusOptions={[
          { value: 'PENDING', label: t('pendingReview') },
          { value: 'APPROVED', label: insurerStatusLabel('APPROVED') },
          { value: 'REJECTED', label: insurerStatusLabel('REJECTED') },
          { value: 'UNDER_REVIEW', label: insurerStatusLabel('UNDER_REVIEW') },
          { value: 'SUBMITTED', label: insurerStatusLabel('SUBMITTED') },
          { value: '', label: tCommon('allStatuses') },
        ]}
        sortOptions={[
          { value: 'submittedAt', label: t('sortSubmitted') },
          { value: 'applicationNumber', label: t('applicationRef') },
          { value: 'premiumAmount', label: t('premium') },
          { value: 'status', label: tCommon('status') },
        ]}
      />

      {isLoading && <ListSkeleton rows={6} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id} className="border-brand-border/60 transition-shadow hover:shadow-card">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                    <ClipboardList className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted">{t('applicationRef')}</p>
                    <p className="font-semibold text-brand-primary-dark">{app.applicationNumber}</p>
                    <p className="text-sm text-brand-muted">
                      {t('premium')}: {formatCurrency(app.premiumAmount, app.currency)}
                    </p>
                  </div>
                </div>
                <Badge variant={applicationStatusTone(app.status)}>
                  {insurerStatusLabel(app.status)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{t('emptyApplications')}</p>
            <p className="mt-1 text-sm text-brand-muted">{t('emptyApplicationsHint')}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <InsurerPagination
          page={page}
          pageSize={pageSize}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </PageContainer>
  );
}
