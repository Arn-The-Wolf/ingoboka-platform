'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { productApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function InsurerProductsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'BUNDLE',
    description: '',
    planCode: 'MONTHLY',
    planName: 'Monthly Plan',
    premiumAmount: 4500,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'products'],
    queryFn: () => productApi.listAdmin(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      productApi.create({
        code: form.code,
        name: form.name,
        category: form.category,
        description: form.description,
        plans: [
          {
            code: form.planCode,
            name: form.planName,
            billingFrequency: 'MONTHLY',
            premiumAmount: form.premiumAmount,
            isDefault: true,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] });
      setShowForm(false);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => productApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] }),
  });

  const products = data?.content ?? [];

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary-dark">{t('manageProducts')}</h1>
          <p className="text-brand-muted">{t('products')}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{t('createProduct')}</Button>
      </header>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            <input
              className="rounded-md border border-brand-border px-3 py-2 text-sm"
              placeholder="Product code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              className="rounded-md border border-brand-border px-3 py-2 text-sm"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="sm:col-span-2 rounded-md border border-brand-border px-3 py-2 text-sm"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!form.code || !form.name}
            >
              {tCommon('save')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && <Alert variant="error">{tCommon('error')}</Alert>}

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-brand-muted">{product.code}</p>
                {product.startingPremium != null && (
                  <p className="text-sm text-brand-primary">
                    {formatCurrency(product.startingPremium, product.currency ?? 'RWF')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={product.status === 'ACTIVE' ? 'active' : 'pending'}>
                  {product.status === 'ACTIVE' ? t('activeProduct') : t('draft')}
                </Badge>
                {product.status !== 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(product.id)}
                  >
                    {t('publish')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
