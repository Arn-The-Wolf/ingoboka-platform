'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { claimApi, insurerApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';

export default function InsurerReportsPage() {
  const t = useTranslations('insurer');
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['insurer', 'stats'],
    queryFn: () => claimApi.getInsurerStats(),
  });
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['insurer', 'policy-report'],
    queryFn: () => insurerApi.getPolicyReport(),
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">{t('reports')}</h1>

      {statsLoading ? <Spinner /> : stats ? (
        <div className="mb-8">
          <InsurerStatsChart stats={stats} title={t('claimsQueue')} />
        </div>
      ) : null}

      {policiesLoading ? <Spinner /> : policies ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('activePolicies')}</p>
              <p className="text-3xl font-bold">{policies.activePolicies}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('enrolledCitizens')}</p>
              <p className="text-3xl font-bold">{policies.citizensEnrolled}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
