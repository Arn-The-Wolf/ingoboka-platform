'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { usePolicyCard } from '@/hooks/use-policies';
import { PolicyCardDisplay } from '@/components/citizen/policy-card-display';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ApiError } from '@/types';

export default function PolicyCardPage() {
  const tCommon = useTranslations('common');
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error, refetch } = usePolicyCard(id);

  return (
    <>
      <CitizenHeader />
      <PageContainer narrow className="flex flex-col items-center">
        <div className="mb-6 w-full">
          <LoadingLink
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-muted hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </LoadingLink>
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
