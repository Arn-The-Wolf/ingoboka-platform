'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BarChart3, FileText, Users } from 'lucide-react';
import { insurerPortalApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { InsurerRwandaMap } from '@/components/insurer/insurer-rwanda-map';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { AdminSelect } from '@/components/admin/admin-select';
import { insurerStatusLabel } from '@/lib/insurer-status';

export default function InsurerReportsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['insurer', 'dashboard'],
    queryFn: () => insurerPortalApi.getDashboard(),
  });

  const claimsChart = useMemo(() => {
    const rows = dashboard?.claimsByStatus ?? [];
    const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
    return filtered.map((row) => ({
      name: insurerStatusLabel(row.status),
      value: row.count,
    }));
  }, [dashboard?.claimsByStatus, statusFilter]);

  const enrollmentChart = useMemo(
    () =>
      (dashboard?.enrollmentByProduct ?? []).map((row) => ({
        name: row.name,
        value: row.count,
      })),
    [dashboard?.enrollmentByProduct]
  );

  return (
    <PageContainer>
      <PageHeader title={t('reports')} subtitle={t('reportsSubtitle')} />

      {isLoading ? (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" shimmer />
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : dashboard ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InsurerStatCard icon={FileText} label={t('openClaims')} value={dashboard.openClaims} />
            <InsurerStatCard icon={BarChart3} label={t('resolvedToday')} value={dashboard.resolvedToday} trendUp />
            <InsurerStatCard icon={Users} label={t('enrolledCitizens')} value={dashboard.citizensEnrolled} />
            <InsurerStatCard icon={FileText} label={t('activePolicies')} value={dashboard.activePolicies} trendUp />
          </div>

          <div className="mb-6 max-w-xs">
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: tCommon('allStatuses') },
                ...(dashboard.claimsByStatus ?? []).map((row) => ({
                  value: row.status,
                  label: insurerStatusLabel(row.status),
                })),
              ]}
              aria-label="Claim status filter"
            />
          </div>

          <div className="mb-8 min-w-0 overflow-hidden">
            <InsurerRwandaMap enrollmentByDistrict={dashboard.enrollmentByDistrict} />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <DistributionChart title={t('enrollmentByProduct')} data={enrollmentChart} defaultType="pie" />
            <DistributionChart title={t('claimsByStatus')} data={claimsChart} defaultType="bar" />
          </div>

          <InsurerStatsChart
            stats={{
              openClaims: dashboard.openClaims,
              resolvedToday: dashboard.resolvedToday,
              avgResolutionDays: dashboard.avgResolutionDays,
              claimsByStatus: (dashboard.claimsByStatus ?? []).map((row) => ({
                status: insurerStatusLabel(row.status),
                count: row.count,
              })),
            }}
            title={t('claimsTrend')}
          />
        </>
      ) : null}

      {isLoading && <ListSkeleton rows={2} className="grid gap-4 sm:grid-cols-2" />}
    </PageContainer>
  );
}
