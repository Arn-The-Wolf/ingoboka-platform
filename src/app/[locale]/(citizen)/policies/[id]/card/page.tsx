'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePolicyCard } from '@/hooks/use-policies';
import { PolicyCardDisplay } from '@/components/citizen/policy-card-display';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import type { ApiError } from '@/types';

export default function PolicyCardPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error, refetch } = usePolicyCard(id);

  return (
    <>
      <CitizenHeader title={t('policyCard')} />
      <PageContainer narrow className="flex flex-col items-center">
        <div className="w-full">
          <PageHeader title={t('policyCard')} backHref="/dashboard" />
        </div>

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

        {data && <PolicyCardDisplay card={data} />}
      </PageContainer>
    </>
  );
}
