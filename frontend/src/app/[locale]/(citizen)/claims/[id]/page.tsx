'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useClaim } from '@/hooks/use-claims';
import { ClaimTimeline } from '@/components/insurer/claim-timeline';
import { buildClaimTimeline } from '@/lib/claim-timeline-utils';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ApiError } from '@/types';

export default function CitizenClaimDetailPage() {
  const tCommon = useTranslations('common');
  const params = useParams();
  const id = params.id as string;
  const { data: claim, isLoading, error, refetch } = useClaim(id);

  const statusLabelMap: Record<string, string> = {
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
    INFO_REQUESTED: 'Information requested',
  };

  return (
    <>
      <CitizenHeader title="Claim status" />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('back')}
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
                  {statusLabelMap[claim.status] ?? claim.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-brand-muted">Policy:</span>{' '}
                  <span className="font-medium">{claim.policyNumber}</span>
                </p>
                <p>
                  <span className="text-brand-muted">Amount:</span>{' '}
                  <span className="font-medium">{formatCurrency(claim.amount, claim.currency)}</span>
                </p>
                <p>
                  <span className="text-brand-muted">Submitted:</span>{' '}
                  {formatDate(claim.submittedAt)}
                </p>
                <p className="text-brand-muted">{claim.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ClaimTimeline
                  steps={buildClaimTimeline(claim.statusHistory, claim.status, claim.submittedAt)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
