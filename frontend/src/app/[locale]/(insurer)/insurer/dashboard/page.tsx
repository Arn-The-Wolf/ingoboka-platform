'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, TrendingUp, Clock, FileText } from 'lucide-react';
import { useClaims, useInsurerStats } from '@/hooks/use-claims';
import { ClaimListItem } from '@/components/insurer/claim-list-item';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/types';

export default function InsurerDashboardPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const { data: stats, isLoading: statsLoading } = useInsurerStats();
  const { data, isLoading, error, refetch } = useClaims();

  const claims = data?.content ?? [];

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary-dark">Muraho, Insurer Partner</h1>
        <p className="text-brand-muted">Here is your portfolio summary for today.</p>
      </header>

      {statsLoading ? (
        <div className="mb-8 flex justify-center">
          <Spinner />
        </div>
      ) : stats ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InsurerStatCard
              icon={ShieldCheck}
              label={t('activePolicies')}
              value={stats.openClaims + 120}
              trend="+12% this month"
              trendUp
            />
            <InsurerStatCard
              icon={FileText}
              label={t('openClaims')}
              value={stats.openClaims}
              trend={`${stats.resolvedToday} resolved today`}
            />
            <InsurerStatCard
              icon={TrendingUp}
              label={t('resolvedToday')}
              value={stats.resolvedToday}
              trend="On track"
              trendUp
            />
            <InsurerStatCard
              icon={Clock}
              label={t('avgResolution')}
              value={`${stats.avgResolutionDays}d`}
              trend="Avg. processing"
            />
          </div>
          <div className="mb-8">
            <InsurerStatsChart stats={stats} title={t('claimsQueue')} />
          </div>
        </>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary-dark">{t('claimsQueue')}</h2>
        <span className="text-sm font-semibold text-brand-primary">{claims.length} pending</span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {(error as ApiError).message ?? tCommon('error')}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            {tCommon('retry')}
          </Button>
        </Alert>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {claims.map((claim) => (
          <ClaimListItem key={claim.id} claim={claim} />
        ))}
      </div>

      {!isLoading && claims.length === 0 && (
        <p className="py-8 text-center text-sm text-brand-muted">No claims in the queue.</p>
      )}
    </div>
  );
}
