'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ClipboardList, Phone, Plus, Users } from 'lucide-react';
import { agentApi } from '@/lib/api';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

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
  const pending = applications.filter((a) => a.status !== 'ACTIVE' && a.status !== 'COMPLETED').length;

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h1>
        <p className="text-brand-muted">{t('assistedEnrollment')}</p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        <InsurerStatCard icon={ClipboardList} label={t('applications')} value={applications.length} />
        <InsurerStatCard icon={Users} label="Pending review" value={pending} trend="Assisted enrollments" />
        <InsurerStatCard
          icon={Phone}
          label="Field agents"
          value={1}
          trend="Active today"
          trendUp
          className="col-span-2 md:col-span-1"
        />
      </div>

      <Card className="mb-8 border-brand-primary/20 shadow-card">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('createApplication')}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('citizenPhone')}</Label>
              <Input
                placeholder="0780000001"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('productPlan')}</Label>
              <Input
                placeholder="Plan UUID"
                value={productPlanId}
                onChange={(e) => setProductPlanId(e.target.value)}
              />
            </div>
          </div>
          {createMutation.isSuccess && (
            <Alert variant="default" className="mt-4">
              Application created successfully.
            </Alert>
          )}
          {createMutation.error && (
            <Alert variant="error" className="mt-4">
              {(createMutation.error as Error).message}
            </Alert>
          )}
          <Button
            className="mt-4 w-full sm:w-auto"
            variant="pill-accent"
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
          >
            {t('createApplication')}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary-dark">{t('applications')}</h2>
        <span className="text-sm font-semibold text-brand-primary">{applications.length} total</span>
      </div>

      {isLoading && <PageSkeleton cards={4} showHeader={false} />}
      {error && <Alert variant="error">{tCommon('error')}</Alert>}

      <div className="grid gap-3 lg:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id} className="border-brand-border/60 transition-shadow hover:shadow-card">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-brand-primary-dark">{app.applicationNumber}</p>
                <p className="text-sm text-brand-muted">
                  {formatCurrency(app.premiumAmount, app.currency)} premium
                </p>
              </div>
              <Badge variant={app.status === 'ACTIVE' ? 'active' : 'pending'}>{app.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-brand-muted">
            No assisted applications yet. Create one for a citizen above.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
