'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { insurerApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function InsurerSettingsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
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

  if (isLoading) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">{t('settings')}</h1>
      <Card>
        <CardContent className="grid gap-3 p-6 max-w-md">
          <p className="text-sm text-brand-muted">{settings?.name}</p>
          <input className="rounded border px-3 py-2 text-sm" placeholder="Contact email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Contact phone"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{tCommon('save')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
