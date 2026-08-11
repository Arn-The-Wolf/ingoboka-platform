'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useClaims, useClaimDelete } from '@/hooks/use-claims';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { claimStatusLabel } from '@/lib/insurer-status';
import type { ApiError, Claim } from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export default function CitizenClaimsPage() {
  const t = useTranslations('citizen.claims');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const showUploadWarning = searchParams.get('uploadPartial') === '1';
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<Claim | null>(null);
  const { data, isLoading, error, refetch } = useClaims(page, pageSize);
  const deleteMutation = useClaimDelete();

  const claims = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? claims.length;

  const statusLabelMap: Record<string, string> = {
    DRAFT: t('draft'),
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
    CANCELLED: t('cancelled'),
    INFO_REQUESTED: t('infoRequested'),
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        refetch();
      },
    });
  };

  return (
    <>
      <CitizenHeader title={t('title')} subtitle={t('subtitle')} />
      <PageContainer>
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Link>
          <LoadingLink href="/claims/new">
            <Button variant="pill" size="sm">
              <Plus className="h-4 w-4" />
              {t('newClaim')}
            </Button>
          </LoadingLink>
        </div>

        {showUploadWarning && (
          <Alert variant="warning" className="mb-4">
            {t('uploadPartialSuccess')}
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {error && (
          <Alert variant="error">
            {(error as ApiError).message ?? tCommon('error')}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              {tCommon('retry')}
            </Button>
          </Alert>
        )}

        {!isLoading && !error && claims.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="font-medium text-brand-primary-dark">{t('noClaims')}</p>
              <p className="text-sm text-brand-muted">{t('emptyHint')}</p>
              <LoadingLink href="/claims/new">
                <Button variant="pill">{t('newClaim')}</Button>
              </LoadingLink>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {claims.map((claim) => (
            <Card key={claim.id} className="transition-shadow hover:shadow-elevated">
              <CardContent className="flex items-center justify-between p-4">
                <LoadingLink href={`/claims/${claim.id}`} className="min-w-0 flex-1">
                  <div className="space-y-1">
                    <p className="font-medium text-brand-primary-dark">{claim.claimNumber}</p>
                    <p className="text-sm text-brand-muted">{claim.policyNumber}</p>
                    <p className="text-xs text-brand-muted">
                      {formatDate(claim.submittedAt)}
                    </p>
                  </div>
                </LoadingLink>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-brand-primary-dark">
                      {formatCurrency(claim.amount, claim.currency)}
                    </p>
                    <Badge variant={policyStatusVariant(claim.status)} className="mt-1">
                      {statusLabelMap[claim.status] ?? claimStatusLabel(claim.status)}
                    </Badge>
                  </div>
                  {claim.status === 'DRAFT' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      aria-label={t('deleteDraft')}
                      onClick={() => setDeleteTarget(claim)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <LoadingLink href={`/claims/${claim.id}`}>
                    <ChevronRight className="h-5 w-5 text-brand-muted" />
                  </LoadingLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && !error && (
          <InsurerPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </PageContainer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteDraftTitle')}
        description={t('deleteDraftDescription')}
        confirmLabel={t('deleteDraftConfirm')}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
