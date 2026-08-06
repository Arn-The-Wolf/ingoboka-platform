'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useClaim, useClaimAppeal } from '@/hooks/use-claims';
import { ClaimTimeline } from '@/components/insurer/claim-timeline';
import { buildClaimTimeline } from '@/lib/claim-timeline-utils';
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
  const params = useParams();
  const id = params.id as string;
  const { data: claim, isLoading, error, refetch } = useClaim(id);
  const appealMutation = useClaimAppeal(id);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const statusLabelMap: Record<string, string> = {
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
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
              </CardContent>
            </Card>

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
    </>
  );
}
