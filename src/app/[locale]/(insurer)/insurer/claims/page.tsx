'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { insurerPortalApi } from '@/lib/api';
import { ClaimListItem } from '@/components/insurer/claim-list-item';
import {
  DEFAULT_LIST_FILTERS,
  InsurerListToolbar,
  type ListToolbarFilters,
} from '@/components/insurer/insurer-list-toolbar';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { useAdminToast } from '@/components/admin/admin-toast';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { insurerStatusLabel } from '@/lib/insurer-status';
import type { ApiError } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function InsurerClaimsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<ListToolbarFilters>(DEFAULT_LIST_FILTERS);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    policyId: '',
    claimType: 'MEDICAL',
    description: '',
    claimedAmount: 0,
    incidentDate: '',
  });

  const queryFilters = useMemo(
    () => ({
      page,
      size: pageSize,
      status: filters.status || undefined,
      search: filters.search || undefined,
      province: filters.province || undefined,
      district: filters.district || undefined,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    }),
    [page, pageSize, filters]
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['insurer', 'claims', queryFilters],
    queryFn: () => insurerPortalApi.listClaims(queryFilters),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      insurerPortalApi.createClaim({
        policyId: createForm.policyId,
        claimType: createForm.claimType,
        description: createForm.description,
        claimedAmount: createForm.claimedAmount || undefined,
        incidentDate: createForm.incidentDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'claims'] });
      queryClient.invalidateQueries({ queryKey: ['insurer', 'dashboard'] });
      setShowCreate(false);
      setCreateForm({ policyId: '', claimType: 'MEDICAL', description: '', claimedAmount: 0, incidentDate: '' });
      toast.success(t('claimCreated'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const claims = data?.content ?? [];

  const handleFilterChange = (patch: Partial<ListToolbarFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('claimsQueue')}
        subtitle={t('pendingCount', { count: data?.totalElements ?? 0 })}
        action={
          <Button variant="pill" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            {t('createClaim')}
          </Button>
        }
      />

      <InsurerListToolbar
        filters={filters}
        onChange={handleFilterChange}
        showAddressFilters
        searchPlaceholder={t('searchClaims')}
        statusOptions={[
          { value: '', label: tCommon('allStatuses') },
          ...['SUBMITTED', 'UNDER_REVIEW', 'INFORMATION_REQUIRED', 'APPROVED', 'REJECTED'].map(
            (s) => ({ value: s, label: insurerStatusLabel(s) })
          ),
        ]}
        sortOptions={[
          { value: 'createdAt', label: t('sortSubmitted') },
          { value: 'claimedAmount', label: t('sortAmount') },
          { value: 'status', label: tCommon('status') },
        ]}
      />

      {isLoading && <ListSkeleton rows={6} />}

      {error && (
        <Alert variant="error" className="mb-4">
          {(error as ApiError).message ?? tCommon('error')}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            {tCommon('retry')}
          </Button>
        </Alert>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {claims.map((claim) => (
          <ClaimListItem key={claim.id} claim={claim} />
        ))}
      </div>

      {!isLoading && claims.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-brand-muted">
            {t('noClaimsInQueue')}
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
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('createClaim')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('policyRef')}</Label>
              <Input
                placeholder="Policy UUID"
                value={createForm.policyId}
                onChange={(e) => setCreateForm({ ...createForm, policyId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('claimType')}</Label>
              <Input
                value={createForm.claimType}
                onChange={(e) => setCreateForm({ ...createForm, claimType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('description')}</Label>
              <textarea
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('amount')}</Label>
                <Input
                  type="number"
                  value={createForm.claimedAmount}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, claimedAmount: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('incidentDate')}</Label>
                <Input
                  type="date"
                  value={createForm.incidentDate}
                  onChange={(e) => setCreateForm({ ...createForm, incidentDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="pill"
              loading={createMutation.isPending}
              disabled={!createForm.policyId || !createForm.description}
              onClick={() => createMutation.mutate()}
            >
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
