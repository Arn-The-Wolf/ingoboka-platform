'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Globe, Mail, Server, Settings, Wrench } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getPlatformSettings(),
    retry: false,
  });

  const fallbackSettings = {
    platformName: 'Ingoboka',
    defaultLocale: 'rw',
    maintenanceMode: false,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1',
    supportEmail: 'support@ingoboka.rw',
  };

  const config = settings ?? (error ? fallbackSettings : null);

  return (
    <PageContainer narrow>
      <PageHeader title={t('settings')} subtitle={t('platformConfigDesc')} />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {config && (
        <Card className="border-brand-border/60 shadow-card">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-surface-container-low p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-light">
                <Settings className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-semibold text-brand-primary-dark">{config.platformName}</p>
                <p className="text-sm text-brand-muted">{t('platformConfig')}</p>
              </div>
            </div>

            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
                <dt className="flex items-center gap-2 text-sm text-brand-muted">
                  <Globe className="h-4 w-4" />
                  {t('defaultLocale')}
                </dt>
                <dd className="font-medium uppercase text-brand-primary-dark">{config.defaultLocale}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
                <dt className="flex items-center gap-2 text-sm text-brand-muted">
                  <Wrench className="h-4 w-4" />
                  {t('maintenanceMode')}
                </dt>
                <dd>
                  <Badge variant={config.maintenanceMode ? 'pending' : 'active'}>
                    {config.maintenanceMode ? t('enabled') : t('disabled')}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
                <dt className="flex items-center gap-2 text-sm text-brand-muted">
                  <Server className="h-4 w-4" />
                  {t('apiBaseUrl')}
                </dt>
                <dd className="max-w-xs truncate text-right font-mono text-xs text-brand-primary-dark">
                  {config.apiBaseUrl}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-sm text-brand-muted">
                  <Mail className="h-4 w-4" />
                  {t('supportEmail')}
                </dt>
                <dd className="font-medium text-brand-primary-dark">{config.supportEmail}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
