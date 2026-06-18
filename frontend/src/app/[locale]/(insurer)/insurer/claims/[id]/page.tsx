'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useClaim, useClaimDecision } from '@/hooks/use-claims';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { ApiError } from '@/types';

export default function ClaimDetailPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const params = useParams();
  const id = params.id as string;
  const { data: claim, isLoading, error, refetch } = useClaim(id);
  const decision = useClaimDecision(id);
  const [notes, setNotes] = useState('');

  const statusLabelMap: Record<string, string> = {
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
    INFO_REQUESTED: t('requestInfo'),
  };

  const handleDecision = (decisionType: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    decision.mutate({ decision: decisionType, notes: notes || undefined });
  };

  return (
    <div className="p-8">
      <Link
        href="/insurer/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      <h1 className="mb-6 text-2xl font-bold">{t('claimDetail')}</h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
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
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{claim.claimNumber}</CardTitle>
              <Badge variant={policyStatusVariant(claim.status)}>
                {statusLabelMap[claim.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-brand-muted">{t('claimant')}</p>
                  <p className="font-medium">{claim.claimantName}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-muted">{t('policyRef')}</p>
                  <p className="font-medium">{claim.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-muted">{t('amount')}</p>
                  <p className="font-semibold text-brand-primary">
                    {formatCurrency(claim.amount, claim.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brand-muted">{t('submittedAt')}</p>
                  <p className="font-medium">{formatDate(claim.submittedAt)}</p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-brand-muted">{t('description')}</p>
                <p className="rounded-lg bg-brand-background p-4 text-sm">{claim.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{tCommon('status')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {decision.isSuccess && (
                <Alert variant="success">{tCommon('save')}</Alert>
              )}
              {decision.error && (
                <Alert variant="error">{(decision.error as ApiError).message}</Alert>
              )}
              <textarea
                className="w-full rounded-md border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                rows={3}
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleDecision('APPROVE')}
                  loading={decision.isPending}
                  disabled={claim.status === 'APPROVED'}
                >
                  {t('approve')}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDecision('REJECT')}
                  loading={decision.isPending}
                  disabled={claim.status === 'REJECTED'}
                >
                  {t('reject')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDecision('REQUEST_INFO')}
                  loading={decision.isPending}
                >
                  {t('requestInfo')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
