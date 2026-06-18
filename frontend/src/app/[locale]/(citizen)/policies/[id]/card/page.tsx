'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePolicyCard } from '@/hooks/use-policies';
import { PolicyCardDisplay } from '@/components/citizen/policy-card-display';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import type { ApiError } from '@/types';

export default function PolicyCardPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error, refetch } = usePolicyCard(id);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      <h1 className="mb-6 text-xl font-bold">{t('policyCard')}</h1>

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
    </div>
  );
}
