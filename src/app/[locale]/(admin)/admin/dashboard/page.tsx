'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, FileText, ScrollText, Shield, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Card, CardContent } from '@/components/ui/card';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

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

  const stats = overview
    ? [
        {
          href: '/admin/organizations',
          icon: Building2,
          value: overview.organizations,
          label: t('organizations'),
          trend: t('trendPartners'),
        },
        {
          href: '/admin/users',
          icon: Users,
          value: overview.activeUsers,
          label: t('activeUsers'),
          trend: t('trendCitizens'),
        },
        {
          href: '/admin/policies',
          icon: Shield,
          value: overview.activePolicies,
          label: t('activePolicies'),
          trend: t('trendCoverage'),
        },
        {
          href: '/admin/claims',
          icon: FileText,
          value: overview.openClaims,
          label: t('openClaims'),
          trend: t('trendClaims'),
        },
        {
          href: '/admin/applications',
          icon: ScrollText,
          value: overview.totalApplications,
          label: t('totalApplications'),
          trend: t('applications'),
        },
      ]
    : [];

  return (
    <PageContainer className="px-0 py-0 sm:px-0">
      <PageHeader title={t('dashboard')} subtitle={t('overview')} />

      {overviewLoading ? (
        <PageSkeleton cards={5} showHeader={false} />
      ) : overviewError ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : overview ? (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <InsurerStatCard
              key={stat.href}
              href={stat.href}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              trend={stat.trend}
              trendUp
              className="h-full hover:scale-100"
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('organizations')}</h2>
            <LoadingLink
              href="/admin/organizations"
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-darker hover:underline"
            >
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
              {recentOrgs.map((org) => (
                <Card
                  key={org.id}
                  className="border-brand-border/70 bg-white transition-all hover:border-brand-primary/25 hover:shadow-elevated"
                >
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary-light text-brand-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-primary-dark">{org.name}</p>
                        <p className="text-sm text-brand-muted">{org.organizationType}</p>
                      </div>
                    </div>
                    <Badge variant={org.status === 'ACTIVE' ? 'active' : 'pending'}>{org.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-brand-border">
              <CardContent className="py-10 text-center text-sm text-brand-muted">
                {t('noOrganizations')}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('recentActivity')}</h2>
            <LoadingLink
              href="/admin/audit"
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-darker hover:underline"
            >
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
                <Card
                  key={entry.id}
                  className="border-brand-border/70 bg-white transition-all hover:border-brand-primary/25 hover:shadow-elevated"
                >
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-brand-primary-dark">{entry.action}</p>
                      <p className="truncate text-sm text-brand-muted">
                        {entry.actor} · {entry.resource}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-brand-muted">
                      {formatDate(entry.occurredAt)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-brand-border">
              <CardContent className="py-10 text-center text-sm text-brand-muted">
                {t('noActivity')}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
