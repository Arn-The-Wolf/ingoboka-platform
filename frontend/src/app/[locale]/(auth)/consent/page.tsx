'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthHeader } from '@/components/layout/auth-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { useConsent } from '@/hooks/use-auth';
import { consentSchema, type ConsentFormData } from '@/lib/validators';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types';

export default function ConsentPage() {
  const t = useTranslations('auth');
  const consent = useConsent();
  const [noticeLang, setNoticeLang] = useState<'en' | 'rw'>('en');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      dataProcessing: undefined,
      marketing: false,
      termsAccepted: undefined,
    },
  });

  const dataProcessing = watch('dataProcessing');
  const termsAccepted = watch('termsAccepted');
  const canSubmit = dataProcessing === true && termsAccepted === true;

  const onSubmit = (data: ConsentFormData) => {
    consent.mutate({
      dataProcessing: data.dataProcessing,
      termsAccepted: data.termsAccepted,
      marketing: data.marketing ?? false,
    });
  };

  const error = consent.error as ApiError | null;

  const noticeEn =
    'We collect your ID and phone number to provide insurance cover. We never sell your data. We share only with licensed medical partners when you make a claim.';
  const noticeRw =
    'Dukusanya indangamuntu yawe n\'inimero ya telefoni kugira ngo tuguhe ubwishingizi. Ntabwo tugurisha amakuru yawe. Tuyasangiza gusa abafatanyabikorwa mu buvuzi igihe uje kwivuza.';

  return (
    <div className="space-y-6">
      <AuthHeader />
      <section>
        <h2 className="text-2xl font-bold text-brand-primary">{t('consentTitle')}</h2>
        <p className="mt-1 text-sm text-brand-muted">{t('consentSubtitle')}</p>
      </section>

      <div className="rounded-xl border border-brand-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Simple Notice</span>
          </div>
          <div className="flex gap-1 rounded-full bg-brand-surface-container p-1">
            <button
              type="button"
              onClick={() => setNoticeLang('en')}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                noticeLang === 'en'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:bg-brand-surface-container-low'
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setNoticeLang('rw')}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                noticeLang === 'rw'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:bg-brand-surface-container-low'
              )}
            >
              Kinyarwanda
            </button>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-brand-primary-dark">
          {noticeLang === 'en' ? noticeEn : noticeRw}
        </p>
        <p className="mt-2 text-xs italic text-brand-muted">
          {noticeLang === 'en'
            ? 'Note: Your data is protected by Law No. 058/2021 in Rwanda.'
            : 'Icyitonderwa: Amakuru yawe arinzwe n\'itegeko No. 058/2021 mu Rwanda.'}
        </p>
      </div>

      <details className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface-container-low">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-brand-surface-container">
          <span className="text-sm font-semibold text-brand-primary">Read full policy</span>
        </summary>
        <div className="max-h-48 overflow-y-auto border-t border-brand-border bg-white p-4 text-sm text-brand-muted">
          <p className="mb-3">
            <strong>1. Data Collection:</strong> We collect personal identification, contact details,
            and transaction history to facilitate microinsurance services under Rwanda Law No.
            058/2021.
          </p>
          <p className="mb-3">
            <strong>2. Use of Information:</strong> Your data is used to verify eligibility, process
            premium payments, and settle claims through partner healthcare providers.
          </p>
          <p>
            <strong>3. Your Rights:</strong> You may access, correct, or request deletion of your
            personal data through Ingoboka Support.
          </p>
        </div>
      </details>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Button
          type="submit"
          className="w-full gap-2 py-6 text-base"
          variant="pill-accent"
          loading={consent.isPending}
          disabled={!canSubmit}
        >
          I Agree &amp; Continue
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
