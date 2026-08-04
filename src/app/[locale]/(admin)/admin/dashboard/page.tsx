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

  return (
    <PageContainer>
      <PageHeader title={t('dashboard')} subtitle={t('overview')} />

      {overviewLoading ? (
        <PageSkeleton cards={5} showHeader={false} />
      ) : overviewError ? (
        <Alert variant="error" className="mb-8">
          {tCommon('error')}
        </Alert>
      ) : overview ? (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <LoadingLink href="/admin/organizations">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-purple-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-purple-900">{overview.organizations}</p>
                    <p className="text-xs text-purple-700">{t('organizations')}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <span className="text-purple-500">↗</span> {t('trendPartners')}
                </p>
              </CardContent>
            </Card>
          </LoadingLink>

          <LoadingLink href="/admin/users">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-blue-900">{overview.activeUsers}</p>
                    <p className="text-xs text-blue-700">{t('activeUsers')}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <span className="text-blue-500">↗</span> {t('trendCitizens')}
                </p>
              </CardContent>
            </Card>
          </LoadingLink>

          <LoadingLink href="/admin/policies">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-green-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-green-900">{overview.activePolicies}</p>
                    <p className="text-xs text-green-700">{t('activePolicies')}</p>
                  </div>
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="text-green-500">↗</span> {t('trendCoverage')}
                </p>
              </CardContent>
            </Card>
          </LoadingLink>

          <LoadingLink href="/admin/claims">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-amber-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-amber-900">{overview.openClaims}</p>
                    <p className="text-xs text-amber-700">{t('openClaims')}</p>
                  </div>
                </div>
                <p className="text-xs text-amber-600">{t('trendClaims')}</p>
              </CardContent>
            </Card>
          </LoadingLink>

          <LoadingLink href="/admin/applications">
            <Card className="col-span-2 lg:col-span-1 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-indigo-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white">
                    <ScrollText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-indigo-900">{overview.totalApplications}</p>
                    <p className="text-xs text-indigo-700">{t('totalApplications')}</p>
                  </div>
                </div>
                <p className="text-xs text-indigo-600">{t('applications')}</p>
              </CardContent>
            </Card>
          </LoadingLink>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{t('organizations')}</h2>
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
              {recentOrgs.map((org, index) => (
                <Card key={org.id} className="border-green-200 bg-white hover:shadow-md transition-all hover:border-green-300">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        index === 0 ? "bg-gradient-to-br from-purple-400 to-purple-600" :
                        index === 1 ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                        index === 2 ? "bg-gradient-to-br from-green-400 to-green-600" :
                        "bg-gradient-to-br from-amber-400 to-amber-600"
                      )}>
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{org.name}</p>
                        <p className="text-sm text-gray-600">{org.organizationType}</p>
                      </div>
                    </div>
                    <Badge variant={org.status === 'ACTIVE' ? 'active' : 'pending'}>{org.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-green-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                {t('noOrganizations')}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{t('recentActivity')}</h2>
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
                <Card key={entry.id} className="border-blue-200 bg-white hover:shadow-md transition-all hover:border-blue-300">
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">{entry.action}</p>
                      <p className="text-sm text-gray-600">
                        {entry.actor} · {entry.resource}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatDate(entry.occurredAt)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-blue-200">
              <CardContent className="py-10 text-center text-sm text-gray-500">
                {t('noActivity')}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
