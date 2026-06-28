'use client';

import { useTranslations } from 'next-intl';
import { useClaims } from '@/hooks/use-claims';
import { ClaimListItem } from '@/components/insurer/claim-list-item';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/types';

export default function InsurerClaimsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const { data, isLoading, error, refetch } = useClaims();

  const claims = data?.content ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={t('claimsQueue')}
        subtitle={t('pendingCount', { count: claims.length })}
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

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
        <p className="py-8 text-center text-sm text-brand-muted">{t('noClaimsInQueue')}</p>
      )}
    </PageContainer>
  );
}
