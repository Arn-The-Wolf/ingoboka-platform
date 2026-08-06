'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ClipboardList } from 'lucide-react';
import { insurerPortalApi } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import {
  DEFAULT_LIST_FILTERS,
  InsurerListToolbar,
  type ListToolbarFilters,
} from '@/components/insurer/insurer-list-toolbar';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { applicationStatusTone, applicationStatusLabel } from '@/lib/insurer-status';
import { formatCurrency } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 10;

export default function InsurerApplicationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role === 'INSURER_CLAIMS_OFFICER') {
      router.replace('/insurer/dashboard');
    }
  }, [user, router]);

  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ListToolbarFilters>({
    ...DEFAULT_LIST_FILTERS,
    status: 'PENDING',
    sortBy: 'submittedAt',
  });
  const [actionId, setActionId] = useState<string | null>(null);

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
    queryKey: ['insurer', 'applications', queryFilters],
    queryFn: () => insurerPortalApi.listApplications(queryFilters),
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string;
      decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
    }) => insurerPortalApi.reviewApplication(id, decision),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['insurer', 'dashboard'] });
      setActionId(null);
      toast.success(
        vars.decision === 'APPROVE'
          ? t('applicationApproved')
          : vars.decision === 'REJECT'
            ? t('applicationRejected')
            : t('applicationInfoRequested')
      );
    },
    onError: () => {
      setActionId(null);
      toast.error(tCommon('error'));
    },
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
        title={t('applicationsQueue')}
        subtitle={t('pendingCount', { count: data?.totalElements ?? 0 })}
      />

      <InsurerListToolbar
        filters={filters}
        onChange={handleFilterChange}
        searchPlaceholder={t('searchApplications')}
        statusOptions={[
          { value: 'PENDING', label: t('pendingApplications') },
          { value: 'APPROVED', label: applicationStatusLabel('APPROVED') },
          { value: 'REJECTED', label: applicationStatusLabel('REJECTED') },
          { value: 'UNDER_REVIEW', label: applicationStatusLabel('UNDER_REVIEW') },
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
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
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
                    {applicationStatusLabel(app.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="pill"
                    className="flex-1 min-w-[100px]"
                    loading={reviewMutation.isPending && actionId === `${app.id}-approve`}
                    onClick={() => {
                      setActionId(`${app.id}-approve`);
                      reviewMutation.mutate({ id: app.id, decision: 'APPROVE' });
                    }}
                  >
                    {t('approveApplication')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 min-w-[100px]"
                    loading={reviewMutation.isPending && actionId === `${app.id}-reject`}
                    onClick={() => {
                      setActionId(`${app.id}-reject`);
                      reviewMutation.mutate({ id: app.id, decision: 'REJECT' });
                    }}
                  >
                    {t('rejectApplication')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 min-w-[100px]"
                    loading={reviewMutation.isPending && actionId === `${app.id}-info`}
                    onClick={() => {
                      setActionId(`${app.id}-info`);
                      reviewMutation.mutate({ id: app.id, decision: 'REQUEST_INFO' });
                    }}
                  >
                    {t('requestInfo')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{t('noApplications')}</p>
            <p className="mt-1 text-sm text-brand-muted">{t('noApplicationsHint')}</p>
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
