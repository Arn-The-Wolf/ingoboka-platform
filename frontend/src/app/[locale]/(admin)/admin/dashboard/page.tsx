'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, FileText, Shield, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.getOverview(),
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h1>
        <p className="text-brand-muted">{t('overview')}</p>
      </header>

      {overviewLoading ? (
        <div className="mb-8 flex justify-center">
          <Spinner />
        </div>
      ) : overviewError ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : overview ? (
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InsurerStatCard icon={Building2} label={t('organizations')} value={overview.organizations} trend="Partners on platform" trendUp />
          <InsurerStatCard icon={Users} label={t('activeUsers')} value={overview.activeUsers} trend="Registered citizens" trendUp />
          <InsurerStatCard icon={Shield} label={t('activePolicies')} value={overview.activePolicies} trend="Live coverage" trendUp />
          <InsurerStatCard icon={FileText} label={t('openClaims')} value={overview.openClaims} trend="Awaiting resolution" />
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary-dark">{t('organizations')}</h2>
        <span className="text-sm text-brand-muted">{organizations?.length ?? 0} partners</span>
      </div>

      {orgsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {organizations?.map((org) => (
            <Card key={org.id} className="border-brand-border/60 transition-shadow hover:shadow-card">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                    <Building2 className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-primary-dark">{org.name}</p>
                    <p className="text-sm text-brand-muted">{org.organizationType}</p>
                    {org.contactEmail && (
                      <p className="text-xs text-brand-outline">{org.contactEmail}</p>
                    )}
                  </div>
                </div>
                <Badge variant={org.status === 'ACTIVE' ? 'active' : 'pending'}>{org.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!orgsLoading && (organizations?.length ?? 0) === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-brand-muted">
            No organizations registered yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
