'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ShieldCheck, TrendingUp, Clock, FileText, Users } from 'lucide-react';
import { insurerPortalApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { InsurerRwandaMap } from '@/components/insurer/insurer-rwanda-map';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingLink } from '@/components/navigation/loading-link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { insurerStatusLabel } from '@/lib/insurer-status';

export default function InsurerDashboardPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['insurer', 'dashboard'],
    queryFn: () => insurerPortalApi.getDashboard(),
  });

  const claimsChart = useMemo(
    () =>
      (dashboard?.claimsByStatus ?? []).map((row) => ({
        name: insurerStatusLabel(row.status),
        value: row.count,
      })),
    [dashboard?.claimsByStatus]
  );

  const enrollmentChart = useMemo(
    () =>
      (dashboard?.enrollmentByProduct ?? []).map((row) => ({
        name: row.name,
        value: row.count,
      })),
    [dashboard?.enrollmentByProduct]
  );

  const provinceChart = useMemo(() => {
    const byProvince = new Map<string, number>();
    for (const row of dashboard?.enrollmentByDistrict ?? []) {
      byProvince.set(row.province, (byProvince.get(row.province) ?? 0) + row.enrolled);
    }
    return Array.from(byProvince.entries()).map(([name, value]) => ({
      name: name.replace(' Province', '').replace('City of Kigali', 'Kigali'),
      value,
    }));
  }, [dashboard?.enrollmentByDistrict]);

  return (
    <PageContainer>
      <PageHeader title={t('greeting')} subtitle={t('portfolioSummary')} />

      {isLoading ? (
        <PageSkeleton cards={4} showHeader={false} />
      ) : error ? (
        <Alert variant="error" className="mb-6">
          {tCommon('error')}
        </Alert>
      ) : dashboard ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InsurerStatCard
              icon={ShieldCheck}
              label={t('activePolicies')}
              value={dashboard.activePolicies}
              trend={t('trendThisMonth')}
              trendUp
              href="/insurer/reports"
            />
            <InsurerStatCard
              icon={Users}
              label={t('enrolledCitizens')}
              value={dashboard.citizensEnrolled}
              trendUp
              href="/insurer/reports"
            />
            <InsurerStatCard
              icon={FileText}
              label={t('openClaims')}
              value={dashboard.openClaims}
              trend={t('resolvedTodayTrend', { count: dashboard.resolvedToday })}
              href="/insurer/claims"
            />
            <InsurerStatCard
              icon={Clock}
              label={t('avgResolution')}
              value={`${Math.round(dashboard.avgResolutionDays)}d`}
              trend={t('avgProcessing')}
              href="/insurer/claims"
            />
          </div>

          <div className="mb-8 min-w-0 overflow-hidden">
            <InsurerRwandaMap enrollmentByDistrict={dashboard.enrollmentByDistrict} />
          </div>

          <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-2">
            <DistributionChart
              title={t('enrollmentByProduct')}
              data={enrollmentChart}
              defaultType="pie"
              viewMoreHref="/insurer/products"
            />
            <DistributionChart
              title={t('enrollmentByProvince')}
              data={provinceChart}
              defaultType="bar"
              viewMoreHref="/insurer/reports"
            />
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <InsurerStatsChart
              stats={{
                openClaims: dashboard.openClaims,
                resolvedToday: dashboard.resolvedToday,
                avgResolutionDays: dashboard.avgResolutionDays,
                claimsByStatus: dashboard.claimsByStatus.map((row) => ({
                  status: insurerStatusLabel(row.status),
                  count: row.count,
                })),
              }}
              title={t('claimsQueue')}
            />
            <DistributionChart
              title={t('claimsByStatus')}
              data={claimsChart}
              defaultType="line"
              viewMoreHref="/insurer/claims"
            />
          </div>

          <div className="flex justify-center">
            <LoadingLink
              href="/insurer/claims"
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-darker"
            >
              <FileText className="h-4 w-4" />
              {t('viewClaimsQueue')}
            </LoadingLink>
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
