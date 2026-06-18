'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.getOverview(),
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h1>
        <p className="text-brand-muted">{t('overview')}</p>
      </header>

      {overviewLoading ? (
        <Spinner />
      ) : overview ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('organizations')}</p>
              <p className="text-3xl font-bold">{overview.organizations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('activeUsers')}</p>
              <p className="text-3xl font-bold">{overview.activeUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('activePolicies')}</p>
              <p className="text-3xl font-bold">{overview.activePolicies}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-brand-muted">{t('openClaims')}</p>
              <p className="text-3xl font-bold">{overview.openClaims}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Alert variant="error">{tCommon('error')}</Alert>
      )}

      <h2 className="mb-4 text-lg font-semibold">{t('organizations')}</h2>
      {orgsLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-3">
          {organizations?.map((org) => (
            <Card key={org.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-brand-muted">{org.organizationType}</p>
                </div>
                <span className="text-sm text-brand-muted">{org.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
