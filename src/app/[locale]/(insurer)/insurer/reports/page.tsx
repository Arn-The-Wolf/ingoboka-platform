'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BarChart3, FileText, Users } from 'lucide-react';
import { claimApi, insurerApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

export default function InsurerReportsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['insurer', 'stats'],
    queryFn: () => claimApi.getInsurerStats(),
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['insurer', 'policy-report'],
    queryFn: () => insurerApi.getPolicyReport(),
  });

  const policyData = policies;

  return (
    <PageContainer>
      <PageHeader title={t('reports')} subtitle={t('reportsSubtitle')} />

      {statsLoading ? (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" shimmer />
          ))}
        </div>
      ) : statsError ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : stats ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InsurerStatCard icon={FileText} label={t('openClaims')} value={stats.openClaims} />
            <InsurerStatCard icon={BarChart3} label={t('resolvedToday')} value={stats.resolvedToday} trendUp />
            <InsurerStatCard
              icon={Users}
              label={t('enrolledCitizens')}
              value={policyData?.citizensEnrolled ?? '—'}
            />
            <InsurerStatCard
              icon={FileText}
              label={t('activePolicies')}
              value={policyData?.activePolicies ?? '—'}
              trendUp
            />
          </div>
          <div className="mb-8">
            <InsurerStatsChart stats={stats} title={t('claimsQueue')} />
          </div>
        </>
      ) : null}

      {policiesLoading ? (
        <ListSkeleton rows={2} className="grid gap-4 sm:grid-cols-2" />
      ) : policyData ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('activePolicies')}</p>
              <p className="text-3xl font-bold text-brand-primary-dark">{policyData.activePolicies ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('enrolledCitizens')}</p>
              <p className="text-3xl font-bold text-brand-primary-dark">{policyData.citizensEnrolled ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
