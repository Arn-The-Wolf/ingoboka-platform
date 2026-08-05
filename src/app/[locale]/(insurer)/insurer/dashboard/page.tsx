'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, TrendingUp, Clock, FileText } from 'lucide-react';
import { useInsurerStats } from '@/hooks/use-claims';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingLink } from '@/components/navigation/loading-link';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function InsurerDashboardPage() {
  const t = useTranslations('insurer');
  const { data: stats, isLoading: statsLoading } = useInsurerStats();

  return (
    <PageContainer>
      <PageHeader title={t('greeting')} subtitle={t('portfolioSummary')} />

      {statsLoading ? (
        <PageSkeleton cards={4} showHeader={false} />
      ) : stats ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <InsurerStatCard
              icon={ShieldCheck}
              label={t('activePolicies')}
              value={stats.activePolicies ?? stats.openClaims}
              trend={t('trendThisMonth')}
              trendUp
              href="/insurer/policies"
            />
            <InsurerStatCard
              icon={FileText}
              label={t('openClaims')}
              value={stats.openClaims}
              trend={t('resolvedTodayTrend', { count: stats.resolvedToday })}
              href="/insurer/claims"
            />
            <InsurerStatCard
              icon={TrendingUp}
              label={t('resolvedToday')}
              value={stats.resolvedToday}
              trend={t('onTrack')}
              trendUp
              href="/insurer/claims"
            />
            <InsurerStatCard
              icon={Clock}
              label={t('avgResolution')}
              value={`${stats.avgResolutionDays}d`}
              trend={t('avgProcessing')}
              href="/insurer/claims"
            />
          </div>
          <div className="mb-6">
            <InsurerStatsChart stats={stats} title={t('claimsQueue')} />
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
