'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Policy } from '@/types';
import { ChevronRight } from 'lucide-react';

interface PolicyListItemProps {
  policy: Policy;
}

export function PolicyListItem({ policy }: PolicyListItemProps) {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');

  return (
    <Link href={`/policies/${policy.id}/card`}>
      <Card className="transition-shadow hover:shadow-elevated">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <p className="font-medium text-brand-primary-dark">{policy.productName}</p>
            <p className="text-xs text-brand-muted">{policy.policyNumber}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-brand-muted">{t('coverage')}:</span>
              <span className="font-medium">
                {formatCurrency(policy.coverageAmount, policy.currency)}
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              {t('validUntil')}: {formatDate(policy.validTo)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={policyStatusVariant(policy.status)}>
              {tCommon(policy.status.toLowerCase() as 'active' | 'pending' | 'expired')}
            </Badge>
            <ChevronRight className="h-5 w-5 text-brand-muted" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
