'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ClipboardList } from 'lucide-react';
import { insurerApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function InsurerApplicationsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [actionId, setActionId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'applications', 'PENDING'],
    queryFn: () => insurerApi.listApplications(0, 50, 'PENDING'),
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'APPROVE' | 'REJECT' }) =>
      insurerApi.reviewApplication(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'applications'] });
      setActionId(null);
    },
    onError: () => setActionId(null),
  });

  const applications = data?.content ?? [];

  return (
    <PageContainer>
      <PageHeader title={t('applicationsQueue')} subtitle={t('applicationsSubtitle')} />

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

      {!isLoading && applications.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id} className="border-brand-border/60 transition-shadow hover:shadow-card">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                      <ClipboardList className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-muted">{t('applicationRef')}</p>
                      <p className="font-semibold text-brand-primary-dark">{app.applicationNumber}</p>
                      <p className="text-sm text-brand-muted">
                        {t('premium')}: {formatCurrency(app.premiumAmount, app.currency)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={policyStatusVariant(app.status)}>{app.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="pill"
                    className="flex-1"
                    loading={reviewMutation.isPending && actionId === `${app.id}-approve`}
                    onClick={() => {
                      setActionId(`${app.id}-approve`);
                      reviewMutation.mutate({ id: app.id, decision: 'APPROVE' });
                    }}
                  >
                    {t('approveApplication')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    loading={reviewMutation.isPending && actionId === `${app.id}-reject`}
                    onClick={() => {
                      setActionId(`${app.id}-reject`);
                      reviewMutation.mutate({ id: app.id, decision: 'REJECT' });
                    }}
                  >
                    {t('rejectApplication')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewMutation.isSuccess && (
        <Alert variant="default" className="mt-4">
          {reviewMutation.variables?.decision === 'APPROVE'
            ? t('applicationApproved')
            : t('applicationRejected')}
        </Alert>
      )}

      {!isLoading && applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{t('noApplications')}</p>
            <p className="mt-1 text-sm text-brand-muted">{t('noApplicationsHint')}</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
