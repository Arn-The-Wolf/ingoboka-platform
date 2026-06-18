'use client';

import { useTranslations } from 'next-intl';
import { useClaims, useInsurerStats } from '@/hooks/use-claims';
import { ClaimListItem } from '@/components/insurer/claim-list-item';
import { InsurerStatsChart } from '@/components/insurer/stats-chart';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h1>
        <p className="text-brand-muted">{t('claimsQueue')}</p>
      </header>

      {statsLoading ? (
        <div className="mb-8 flex justify-center">
          <Spinner />
        </div>
      ) : stats ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-brand-muted">{t('openClaims')}</p>
                <p className="text-3xl font-bold text-brand-primary">{stats.openClaims}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-brand-muted">{t('resolvedToday')}</p>
                <p className="text-3xl font-bold text-brand-success">{stats.resolvedToday}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-brand-muted">{t('avgResolution')}</p>
                <p className="text-3xl font-bold text-brand-secondary">
                  {stats.avgResolutionDays}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-8">
            <InsurerStatsChart stats={stats} title={t('claimsQueue')} />
          </div>
        </>
      ) : null}

      <h2 className="mb-4 text-lg font-semibold">{t('claimsQueue')}</h2>

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
    </div>
  );
}
