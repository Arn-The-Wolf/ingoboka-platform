'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AuthHeader } from '@/components/layout/auth-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConsent } from '@/hooks/use-auth';
import { consentSchema, type ConsentFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function ConsentPage() {
  const t = useTranslations('auth');
  const consent = useConsent();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      dataProcessing: undefined,
      marketing: false,
      termsAccepted: undefined,
    },
  });

  const onSubmit = (data: ConsentFormData) => {
    consent.mutate({
      dataProcessing: data.dataProcessing,
      termsAccepted: data.termsAccepted,
      marketing: data.marketing ?? false,
    });
  };

  const error = consent.error as ApiError | null;

  return (
    <div className="space-y-8">
      <AuthHeader />
      <Card>
        <CardHeader>
          <CardTitle>{t('consentTitle')}</CardTitle>
          <CardDescription>{t('consentSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <Alert variant="error">{error.message}</Alert>}
            <Controller
              name="dataProcessing"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={t('consentData')}
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.dataProcessing?.message}
                />
              )}
            />
            <Controller
              name="marketing"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={t('consentMarketing')}
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={t('consentTerms')}
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.termsAccepted?.message}
                />
              )}
            />
            <Button type="submit" className="w-full" loading={consent.isPending}>
              {t('consent')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
