'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { customerApiExt } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function DependantsPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', relationship: 'CHILD' });

  const { data, isLoading } = useQuery({
    queryKey: ['dependants'],
    queryFn: () => customerApiExt.listDependants(),
  });

  const addMutation = useMutation({
    mutationFn: () => customerApiExt.addDependant(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependants'] });
      setForm({ firstName: '', lastName: '', relationship: 'CHILD' });
    },
  });

  const dependants = (data as Array<{ id: string; firstName: string; lastName: string; relationship: string }>) ?? [];

  return (
    <div className="mx-auto max-w-lg p-4 pb-24">
      <h1 className="mb-4 text-xl font-bold">{t('dependants')}</h1>

      <Card className="mb-6">
        <CardContent className="grid gap-2 p-4">
          <input className="rounded border px-3 py-2 text-sm" placeholder="First name" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Last name" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <select className="rounded border px-3 py-2 text-sm" value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
            <option value="CHILD">Child</option>
            <option value="SPOUSE">Spouse</option>
            <option value="PARENT">Parent</option>
          </select>
          <Button onClick={() => addMutation.mutate()} loading={addMutation.isPending}>{tCommon('save')}</Button>
        </CardContent>
      </Card>

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {dependants.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <p className="font-medium">{d.firstName} {d.lastName}</p>
                <p className="text-sm text-brand-muted">{d.relationship}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
