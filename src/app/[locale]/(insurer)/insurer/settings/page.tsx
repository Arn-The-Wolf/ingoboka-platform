'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, Mail, Phone, Save } from 'lucide-react';
import { insurerApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InsurerSettingsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'settings'],
    queryFn: () => insurerApi.getSettings(),
  });

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const settings = data as { contactEmail?: string; contactPhone?: string; name?: string } | undefined;

  useEffect(() => {
    if (settings?.contactEmail) setEmail(settings.contactEmail);
    if (settings?.contactPhone) setPhone(settings.contactPhone);
  }, [settings?.contactEmail, settings?.contactPhone]);

  const saveMutation = useMutation({
    mutationFn: () => insurerApi.updateSettings({ contactEmail: email, contactPhone: phone }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insurer', 'settings'] }),
  });

  if (isLoading) {
    return (
      <PageContainer narrow>
        <PageSkeleton cards={1} showHeader={false} />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader title={t('settings')} subtitle={t('settingsSubtitle')} />

      {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

      <Card className="border-brand-border/60 shadow-card">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-surface-container-low p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary-light">
              <Building2 className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-primary-dark">
                {settings?.name ?? t('yourOrganization')}
              </p>
              <p className="text-sm text-brand-muted">{t('orgAccount')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-muted" />
                {t('contactEmail')}
              </Label>
              <Input
                type="email"
                placeholder="claims@insurer.rw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-muted" />
                {t('contactPhone')}
              </Label>
              <Input
                type="tel"
                placeholder="+250 788 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {saveMutation.isSuccess && (
            <Alert variant="default" className="mt-4">
              {t('settingsSaved')}
            </Alert>
          )}

          <Button
            className="mt-6 gap-2"
            variant="pill-accent"
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {tCommon('save')}
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
