'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Package, Plus } from 'lucide-react';
import { productApi } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import {
  DEFAULT_LIST_FILTERS,
  InsurerListToolbar,
  type ListToolbarFilters,
} from '@/components/insurer/insurer-list-toolbar';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { ProductFormDialog } from '@/components/insurer/product-form-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  isProductDraft,
  isProductPublished,
  productStatusLabel,
  productStatusTone,
  insurerStatusLabel,
} from '@/lib/insurer-status';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency, cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 8;

export default function InsurerProductsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const readOnly = user?.role === 'INSURER_CLAIMS_OFFICER';
  const toast = useAdminToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<ListToolbarFilters>({
    ...DEFAULT_LIST_FILTERS,
    sortBy: 'name',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'products', page, pageSize, filters.status],
    queryFn: () => productApi.listAdmin(page, pageSize, filters.status || undefined),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => productApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] });
      toast.success(t('productPublished'));
    },
    onError: (err: Error) => toast.error(err.message || tCommon('error')),
  });

  const products = data?.content ?? [];

  const handleFilterChange = (patch: Partial<ListToolbarFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  return (
    <>
      <div className={cn('p-6 lg:p-8', showForm && 'pointer-events-none blur-sm')}>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary-dark">
            {readOnly ? t('products') : t('manageProducts')}
          </h1>
          <p className="text-sm text-brand-muted">
            {readOnly ? t('productsViewOnly') : t('products')}
          </p>
        </div>
        {!readOnly && (
          <Button variant="pill" onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createProduct')}
          </Button>
        )}
      </header>

      <InsurerListToolbar
        filters={filters}
        onChange={handleFilterChange}
        searchPlaceholder={t('searchProducts')}
        statusOptions={[
          { value: '', label: tCommon('allStatuses') },
          { value: 'DRAFT', label: productStatusLabel('DRAFT') },
          { value: 'PUBLISHED', label: productStatusLabel('PUBLISHED') },
          { value: 'ARCHIVED', label: productStatusLabel('ARCHIVED') },
        ]}
        sortOptions={[
          { value: 'name', label: t('sortName') },
          { value: 'code', label: t('sortCode') },
          { value: 'category', label: t('sortCategory') },
          { value: 'status', label: tCommon('status') },
        ]}
      />

      {isLoading && <ListSkeleton rows={6} />}

      {error && <Alert variant="error">{tCommon('error')}</Alert>}

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="border-brand-border/60 transition-shadow hover:shadow-elevated">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                  <Package className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{product.name}</p>
                  <p className="text-sm text-brand-muted">{product.code}</p>
                  <p className="text-xs text-brand-muted">{insurerStatusLabel(product.category)}</p>
                  {product.startingPremium != null && (
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatCurrency(product.startingPremium, product.currency ?? 'RWF')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={productStatusTone(product.status)}>
                  {productStatusLabel(product.status)}
                </Badge>
                {isProductDraft(product.status) && !readOnly && (
                  <Button
                    size="sm"
                    variant="pill"
                    loading={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(product.id)}
                  >
                    {t('publish')}
                  </Button>
                )}
                {isProductPublished(product.status) && (
                  <Button size="sm" variant="outline" disabled>
                    {t('published')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && products.length === 0 && !showForm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-brand-muted">
            {t('noProducts')}
          </CardContent>
        </Card>
      )}

      {data && (
        <InsurerPagination
          page={page}
          pageSize={pageSize}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[8, 10, 20, 50]}
        />
      )}
      </div>

      {!readOnly && (
        <ProductFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] });
            toast.success(t('productCreated'));
          }}
        />
      )}
    </>
  );
}
