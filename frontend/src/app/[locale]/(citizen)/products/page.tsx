'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { productApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const t = useTranslations('citizen');
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.list(),
  });

  const products = data?.content ?? [];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('browseProducts')}</h1>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            {t('dashboard')}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && <p className="text-sm text-red-600">Failed to load products.</p>}

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <h2 className="font-semibold">{product.name}</h2>
              <p className="mt-1 text-sm text-brand-muted">{product.description}</p>
              {product.startingPremium != null && (
                <p className="mt-2 text-sm font-medium text-brand-primary">
                  From {formatCurrency(product.startingPremium)} / plan
                </p>
              )}
              <Link href={`/products/${product.id}/enroll`}>
                <Button className="mt-3 w-full" size="sm">
                  View &amp; enroll
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
