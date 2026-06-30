'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AdminOrganizationsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  return (
    <PageContainer>
      <PageHeader
        title={t('organizations')}
        subtitle={t('partnerCount', { count: organizations?.length ?? 0 })}
      />

      {isLoading && <ListSkeleton rows={6} />}

      {error && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && (organizations?.length ?? 0) > 0 && (
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
                    {org.slug && <p className="text-xs text-brand-outline">{org.slug}</p>}
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

      {!isLoading && (organizations?.length ?? 0) === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-brand-muted">
            {t('noOrganizations')}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
