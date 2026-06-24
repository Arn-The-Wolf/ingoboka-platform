'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Claim } from '@/types';
import { ChevronRight } from 'lucide-react';

interface ClaimListItemProps {
  claim: Claim;
}

export function ClaimListItem({ claim }: ClaimListItemProps) {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');

  const statusLabelMap: Record<string, string> = {
    SUBMITTED: tCommon('submitted'),
    UNDER_REVIEW: tCommon('underReview'),
    APPROVED: tCommon('approved'),
    REJECTED: tCommon('rejected'),
    INFO_REQUESTED: t('requestInfo'),
  };

  return (
    <Link href={`/insurer/claims/${claim.id}`}>
      <Card className="transition-shadow hover:shadow-elevated">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium text-brand-primary-dark">{claim.claimNumber}</p>
            <p className="text-sm text-brand-muted">{claim.claimantName}</p>
            <p className="text-xs text-brand-muted">
              {t('submittedAt')}: {formatDate(claim.submittedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-semibold text-brand-primary-dark">
              {formatCurrency(claim.amount, claim.currency)}
            </p>
            <Badge variant={policyStatusVariant(claim.status)}>
              {statusLabelMap[claim.status]}
            </Badge>
            <ChevronRight className="h-5 w-5 text-brand-muted" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
