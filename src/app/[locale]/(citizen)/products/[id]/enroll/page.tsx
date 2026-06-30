'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { enrollmentApi, paymentApi, productApi } from '@/lib/api';
import { getProductHeroImage } from '@/lib/product-images';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function EnrollPage() {
  const t = useTranslations('citizen.enroll');
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const productId = params.id;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'pay' | 'done'>('plan');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [providerRef, setProviderRef] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pollMessage, setPollMessage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getById(productId),
  });

  const enrollMutation = useMutation({
    mutationFn: async (planId: string) => {
      const app = await enrollmentApi.createApplication(planId);
      const submitted = await enrollmentApi.submitApplication(app.id);
      const payment = await paymentApi.initiate({ applicationId: submitted.id });
      return payment;
    },
    onSuccess: (payment) => {
      setPaymentId(payment.id);
      setProviderRef(payment.providerReference ?? payment.paymentReference);
      setPaymentError(null);
      setStep('pay');
    },
  });

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!paymentId || !providerRef) throw new Error('Payment not initialized');

      setPollMessage(t('waitingConfirm'));

      try {
        await paymentApi.pollUntilSettled(paymentId, { intervalMs: 2000, maxAttempts: 4 });
      } catch {
        setPollMessage(t('sandboxSimulate'));
        await paymentApi.confirmSandboxPayment(providerRef);
        await paymentApi.pollUntilSettled(paymentId, { intervalMs: 1500, maxAttempts: 12 });
      }
    },
    onSuccess: () => {
      setPaymentError(null);
      setPollMessage(null);
      setStep('done');
      setTimeout(() => router.push('/dashboard'), 1500);
    },
    onError: (err: Error) => {
      setPollMessage(null);
      setPaymentError(err.message);
    },
  });

  const stepNum = step === 'plan' ? 1 : step === 'pay' ? 2 : 3;

  if (isLoading || !product) {
    return (
      <PageContainer narrow>
        <Skeleton className="mb-4 h-40 w-full rounded-xl" shimmer />
        <Skeleton className="mb-6 h-8 w-48" shimmer />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" shimmer />
          <Skeleton className="h-20 w-full rounded-xl" shimmer />
        </div>
      </PageContainer>
    );
  }

  const selectedPlan = product.plans?.find((p) => p.id === selectedPlanId);

  return (
    <>
      <CitizenHeader title={product.name} />
      <PageContainer narrow>
        <Link href="/products" className="text-sm font-medium text-brand-primary hover:underline">
          {t('backToProducts')}
        </Link>

        <div className="relative mb-6 mt-4 h-40 overflow-hidden rounded-xl">
          <Image
            src={getProductHeroImage(product)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <span className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-0.5 text-xs font-semibold uppercase text-brand-primary-dark">
              {t('badge')}
            </span>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          </div>
        </div>

        <StepIndicator totalSteps={3} currentStep={stepNum} className="mb-6" />

        {step === 'plan' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-primary-dark">{t('choosePlan')}</h2>
              <p className="text-sm text-brand-muted">{product.termsSummary ?? product.description}</p>
            </div>
            {product.plans?.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'cursor-pointer border-brand-border transition-all hover:shadow-md',
                  selectedPlanId === plan.id && 'border-brand-primary ring-2 ring-brand-primary/30'
                )}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-brand-primary-dark">{plan.name}</p>
                    <p className="text-sm text-brand-muted">{plan.billingFrequency}</p>
                  </div>
                  <p className="text-lg font-bold text-brand-primary">
                    {formatCurrency(plan.premiumAmount)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {enrollMutation.error && (
              <Alert variant="error">{(enrollMutation.error as Error).message}</Alert>
            )}
            <Button
              className="w-full"
              variant="pill-accent"
              disabled={!selectedPlanId || enrollMutation.isPending}
              loading={enrollMutation.isPending}
              onClick={() => selectedPlanId && enrollMutation.mutate(selectedPlanId)}
            >
              {t('continuePayment')}
            </Button>
          </div>
        )}

        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
              <h2 className="mb-4 text-lg font-semibold text-brand-primary-dark">{t('paymentSummary')}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">{t('productLabel')}</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                {selectedPlan && (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">{t('planLabel')}</span>
                    <span className="font-medium">{formatCurrency(selectedPlan.premiumAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-brand-border pt-2 font-semibold">
                  <span>{t('total')}</span>
                  <span className="text-brand-primary">
                    {selectedPlan ? formatCurrency(selectedPlan.premiumAmount) : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-brand-primary bg-brand-primary-light p-4"
              >
                <Smartphone className="h-6 w-6 text-brand-primary" />
                <span className="text-sm font-semibold">{t('mobileMoney')}</span>
              </button>
              <button
                type="button"
                disabled
                className="flex flex-col items-center gap-2 rounded-xl border border-brand-border p-4 opacity-60"
              >
                <CreditCard className="h-6 w-6 text-brand-muted" />
                <span className="text-sm font-semibold text-brand-muted">{t('cardSoon')}</span>
              </button>
            </div>

            {providerRef && (
              <Alert variant="default">
                {t('paymentRef', { ref: providerRef })}
              </Alert>
            )}

            {paymentError && <Alert variant="error">{paymentError}</Alert>}

            {pollMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-brand-primary/20 bg-brand-primary-light/50 px-4 py-3 text-sm text-brand-primary-dark">
                <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                {pollMessage}
              </div>
            )}

            <Button
              className="w-full"
              variant="pill-accent"
              onClick={() => completePaymentMutation.mutate()}
              disabled={completePaymentMutation.isPending}
              loading={completePaymentMutation.isPending}
            >
              {completePaymentMutation.isPending ? t('confirming') : t('confirmPaid')}
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-brand-success" />
            <h2 className="text-xl font-bold text-brand-primary-dark">{t('completeTitle')}</h2>
            <p className="mt-2 text-sm text-brand-muted">{t('completeSubtitle')}</p>
          </div>
        )}
      </PageContainer>
    </>
  );
}
