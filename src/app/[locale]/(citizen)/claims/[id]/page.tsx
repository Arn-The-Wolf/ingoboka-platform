'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useClaim, useClaimAppeal, useClaimCancel, useClaimDelete } from '@/hooks/use-claims';
import { ClaimTimeline } from '@/components/insurer/claim-timeline';
import { ClaimDocumentList } from '@/components/claims/claim-document-list';
import { buildClaimTimeline, getLatestDecisionNote } from '@/lib/claim-timeline-utils';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/utils';
import { claimStatusLabel } from '@/lib/insurer-status';
import type { ApiError } from '@/types';

export default function CitizenClaimDetailPage() {
  const t = useTranslations('citizen.claims');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: claim, isLoading, error, refetch } = useClaim(id);
  const appealMutation = useClaimAppeal(id);
  const cancelMutation = useClaimCancel(id);
  const deleteMutation = useClaimDelete();
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statusLabelMap: Record<string, string> = {
    DRAFT: t('draft'),
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
    CANCELLED: t('cancelled'),
    INFO_REQUESTED: t('infoRequested'),
  };

  const handleAppeal = () => {
    if (!appealReason.trim()) return;
    appealMutation.mutate(appealReason.trim(), {
      onSuccess: () => {
        setAppealSubmitted(true);
        setAppealReason('');
        refetch();
      },
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setCancelOpen(false);
        router.push('/claims');
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push('/claims');
      },
    });
  };

  const canDelete = claim?.status === 'DRAFT';
  const canCancel = claim?.status === 'SUBMITTED';
  const decisionNote = claim ? getLatestDecisionNote(claim.statusHistory, claim.status) : undefined;
  const showDecisionReason =
    claim &&
    ['APPROVED', 'REJECTED', 'INFO_REQUESTED'].includes(claim.status) &&
    !!decisionNote;

  return (
    <>
      <CitizenHeader title={t('detailTitle')} />
      <PageContainer narrow>
        <Link
          href="/claims"
          className="mb-4 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToClaims')}
        </Link>

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

        {claim && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                <Badge variant={policyStatusVariant(claim.status)}>
                  {statusLabelMap[claim.status] ?? claimStatusLabel(claim.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-brand-muted">{t('policyLabel')}:</span>{' '}
                  <span className="font-medium">{claim.policyNumber}</span>
                </p>
                <p>
                  <span className="text-brand-muted">{t('amountLabel')}:</span>{' '}
                  <span className="font-medium">{formatCurrency(claim.amount, claim.currency)}</span>
                </p>
                <p>
                  <span className="text-brand-muted">{t('submittedLabel')}:</span>{' '}
                  {formatDate(claim.submittedAt)}
                </p>
                <p className="text-brand-muted">{claim.description}</p>
                {(canDelete || canCancel) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                        loading={deleteMutation.isPending}
                      >
                        {t('deleteDraft')}
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelOpen(true)}
                        loading={cancelMutation.isPending}
                      >
                        {t('cancelClaim')}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {cancelMutation.error && (
              <Alert variant="error">{(cancelMutation.error as ApiError).message}</Alert>
            )}

            {deleteMutation.error && (
              <Alert variant="error">{(deleteMutation.error as ApiError).message}</Alert>
            )}

            {showDecisionReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('decisionReasonTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-muted">{decisionNote}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('timelineTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ClaimTimeline
                  steps={buildClaimTimeline(claim.statusHistory, claim.status, claim.submittedAt)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ClaimDocumentList
                  claimId={id}
                  title={t('documentsTitle')}
                  emptyLabel={t('documentsEmpty')}
                  viewLabel={t('viewDocument')}
                  errorLabel={t('documentOpenError')}
                />
              </CardContent>
            </Card>

            {claim.status === 'REJECTED' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('appealTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appealSubmitted ? (
                    <Alert variant="success">{t('appealSuccess')}</Alert>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="appeal-reason">{t('appealReason')}</Label>
                        <textarea
                          id="appeal-reason"
                          className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          rows={4}
                          value={appealReason}
                          onChange={(e) => setAppealReason(e.target.value)}
                          placeholder={t('appealReasonPlaceholder')}
                        />
                      </div>
                      <Button
                        variant="pill"
                        disabled={!appealReason.trim() || appealMutation.isPending}
                        loading={appealMutation.isPending}
                        onClick={handleAppeal}
                      >
                        {t('appealSubmit')}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageContainer>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('cancelClaimTitle')}
        description={t('cancelClaimDescription')}
        confirmLabel={t('cancelClaimConfirm')}
        onConfirm={handleCancel}
        loading={cancelMutation.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('deleteDraftTitle')}
        description={t('deleteDraftDescription')}
        confirmLabel={t('deleteDraftConfirm')}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
