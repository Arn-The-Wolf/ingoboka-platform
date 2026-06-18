'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { agentApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AgentDashboardPage() {
  const t = useTranslations('agent');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [citizenPhone, setCitizenPhone] = useState('0780000001');
  const [productPlanId, setProductPlanId] = useState('40404040-4040-4040-4040-404040404040');

  const { data, isLoading, error } = useQuery({
    queryKey: ['agent', 'applications'],
    queryFn: () => agentApi.listApplications(),
  });

  const createMutation = useMutation({
    mutationFn: () => agentApi.createAssistedApplication(citizenPhone, productPlanId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent', 'applications'] }),
  });

  const applications = data?.content ?? [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h1>
        <p className="text-brand-muted">{t('assistedEnrollment')}</p>
      </header>

      <Card className="mb-8">
        <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-brand-muted">{t('citizenPhone')}</label>
            <input
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm"
              value={citizenPhone}
              onChange={(e) => setCitizenPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-brand-muted">{t('productPlan')}</label>
            <input
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm"
              value={productPlanId}
              onChange={(e) => setProductPlanId(e.target.value)}
            />
          </div>
          <Button
            className="sm:col-span-2"
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
          >
            {t('createApplication')}
          </Button>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">{t('applications')}</h2>

      {isLoading && <Spinner />}
      {error && <Alert variant="error">{tCommon('error')}</Alert>}

      <div className="grid gap-3">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{app.applicationNumber}</p>
                <p className="text-sm text-brand-muted">{app.premiumAmount} {app.currency}</p>
              </div>
              <Badge>{app.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
