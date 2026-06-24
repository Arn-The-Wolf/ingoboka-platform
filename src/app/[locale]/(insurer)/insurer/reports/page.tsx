'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BarChart3, FileText, Users } from 'lucide-react';
import { claimApi, insurerApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
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
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('reports')}</h1>
        <p className="text-sm text-brand-muted">Portfolio performance and claims analytics.</p>
      </header>

      {statsLoading ? (
        <div className="mb-8 flex justify-center">
          <Spinner />
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
        <Spinner />
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
    </div>
  );
}
