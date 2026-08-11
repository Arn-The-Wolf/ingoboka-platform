'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, FileText, ScrollText, Shield, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Card, CardContent } from '@/components/ui/card';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { RwandaMap } from '@/components/admin/rwanda-map';
import { getProvinceRegions } from '@/lib/rwanda-geo';
import {
  auditActionLabel,
  orgStatusLabel,
  orgStatusTone,
  orgTypeLabel,
  outcomeLabel,
  resourceTypeLabel,
} from '@/lib/status-label';
import { formatDate, cn } from '@/lib/utils';

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

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin', 'audit', 'recent'],
    queryFn: () => adminApi.listAuditLog(0, 5),
    retry: false,
  });

  const recentOrgs = organizations?.slice(0, 4) ?? [];
  const recentAudit = auditData?.content ?? [];

  const provinceChart = useMemo(
    () =>
      getProvinceRegions().map((p) => ({
        name: p.code === 'KV' ? 'Kigali' : p.name.replace(' Province', ''),
        value: p.insured,
      })),
    []
  );

  const partnersByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const org of organizations ?? []) {
      counts.set(org.status, (counts.get(org.status) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, value]) => ({
      name: orgStatusLabel(status),
      value,
    }));
  }, [organizations]);

  const kpis = [
    { href: '/admin/organizations', icon: Building2, value: overview?.organizations, label: t('partners'), theme: 'purple' },
    { href: '/admin/users', icon: Users, value: overview?.activeUsers, label: t('activeUsers'), theme: 'blue' },
    { href: '/admin/policies', icon: Shield, value: overview?.activePolicies, label: t('activePolicies'), theme: 'brand' },
    { href: '/admin/policies', icon: FileText, value: overview?.openClaims, label: t('openClaims'), theme: 'amber' },
    { href: '/admin/audit', icon: ScrollText, value: overview?.totalApplications, label: t('totalApplications'), theme: 'indigo' },
  ] as const;

  const themeClasses: Record<string, string> = {
    purple: 'border-purple-200 from-purple-50 to-purple-100/50 hover:border-purple-300',
    blue: 'border-blue-200 from-blue-50 to-blue-100/50 hover:border-blue-300',
    brand: 'border-brand-primary/20 from-brand-primary-light to-brand-primary-light/50 hover:border-brand-primary/30',
    amber: 'border-amber-200 from-amber-50 to-amber-100/50 hover:border-amber-300',
    indigo: 'border-indigo-200 from-indigo-50 to-indigo-100/50 hover:border-indigo-300',
  };
  const iconTheme: Record<string, string> = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    brand: 'bg-brand-primary',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <PageContainer>
      <PageHeader title={t('welcomeTitle')} subtitle={t('welcomeSubtitle')} />

      {overviewLoading ? (
        <PageSkeleton cards={5} showHeader={false} />
      ) : overviewError ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <LoadingLink key={kpi.label} href={kpi.href} className="min-w-0">
                <Card className={cn('bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg', themeClasses[kpi.theme])}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white', iconTheme[kpi.theme])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-2xl font-bold text-brand-primary-dark">{kpi.value ?? 0}</p>
                        <p className="truncate text-xs text-brand-muted">{kpi.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LoadingLink>
            );
          })}
        </div>
      )}

      {/* Rwanda coverage map */}
      <div className="mb-8 min-w-0 overflow-hidden">
        <RwandaMap />
      </div>

      {/* Distribution charts with type toggle + view more */}
      <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-2">
        <DistributionChart
          title={t('usersByProvince')}
          data={provinceChart}
          defaultType="bar"
          viewMoreHref="/admin/geography"
        />
        <DistributionChart
          title={t('partnersByStatus')}
          data={partnersByStatus}
          defaultType="pie"
          viewMoreHref="/admin/organizations"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('partners')}</h2>
            <LoadingLink href="/admin/organizations" className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark hover:underline">
              {t('viewAllOrganizations')}
            </LoadingLink>
          </div>

          {orgsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" shimmer />
              <Skeleton className="h-20 rounded-xl" shimmer />
            </div>
          ) : recentOrgs.length > 0 ? (
            <div className="grid gap-3">
              {recentOrgs.map((org, index) => (
                <Card key={org.id} className="border-brand-primary/20 bg-white transition-all hover:border-brand-primary/30 hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        index === 0 ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                          : index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                          : index === 2 ? 'bg-gradient-to-br from-brand-primary to-brand-primary-darker'
                          : 'bg-gradient-to-br from-amber-400 to-amber-600'
                      )}>
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-primary-dark">{org.name}</p>
                        <p className="text-sm text-brand-muted">{orgTypeLabel(org.organizationType)}</p>
                      </div>
                    </div>
                    <Badge variant={orgStatusTone(org.status)}>{orgStatusLabel(org.status)}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-brand-primary/20">
              <CardContent className="py-10 text-center text-sm text-brand-muted">{t('noOrganizations')}</CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('recentActivity')}</h2>
            <LoadingLink href="/admin/audit" className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark hover:underline">
              {t('viewAuditLog')}
            </LoadingLink>
          </div>

          {auditLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-xl" shimmer />
              <Skeleton className="h-16 rounded-xl" shimmer />
            </div>
          ) : recentAudit.length > 0 ? (
            <div className="space-y-2">
              {recentAudit.map((entry) => (
                <Card key={entry.id} className="border-blue-200 bg-white transition-all hover:border-blue-300 hover:shadow-md">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-brand-primary-dark">{auditActionLabel(entry.action)}</p>
                      <p className="text-sm text-brand-muted">{entry.actor} · {resourceTypeLabel(entry.resource)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-brand-muted">{formatDate(entry.occurredAt)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-blue-200">
              <CardContent className="py-10 text-center text-sm text-brand-muted">{t('noActivity')}</CardContent>
            </Card>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
