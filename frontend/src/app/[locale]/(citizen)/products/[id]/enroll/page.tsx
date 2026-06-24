'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CheckCircle2, CreditCard, Smartphone } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { enrollmentApi, paymentApi, productApi } from '@/lib/api';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function EnrollPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const tCommon = useTranslations('common');
  const productId = params.id;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'pay' | 'done'>('plan');
  const [providerRef, setProviderRef] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success'>('idle');

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
      setProviderRef(payment.providerReference ?? payment.paymentReference);
      setStep('pay');
    },
  });

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      setPaymentStatus('pending');
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090/api/v1'}/payments/sandbox/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerReference: providerRef,
            status: 'SUCCESS',
          }),
        }
      );
    },
    onSuccess: () => {
      setPaymentStatus('success');
      setStep('done');
      setTimeout(() => router.push('/dashboard'), 1500);
    },
    onError: () => setPaymentStatus('idle'),
  });

  const stepNum = step === 'plan' ? 1 : step === 'pay' ? 2 : 3;

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const selectedPlan = product.plans?.find((p) => p.id === selectedPlanId);

  return (
    <>
      <CitizenHeader title={product.name} />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <Link href="/products" className="text-sm font-medium text-brand-primary hover:underline">
          ← Back to products
        </Link>

        <div className="relative mb-6 mt-4 h-40 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-brand-primary/80" />
          <div className="absolute bottom-0 left-0 p-4">
            <span className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-0.5 text-xs font-semibold uppercase text-brand-primary-dark">
              Enroll
            </span>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          </div>
        </div>

        <StepIndicator totalSteps={3} currentStep={stepNum} className="mb-6" />

        {step === 'plan' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-primary-dark">Choose your plan</h2>
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
              Continue to payment
            </Button>
          </div>
        )}

        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card">
              <h2 className="mb-4 text-lg font-semibold text-brand-primary-dark">Payment summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Product</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                {selectedPlan && (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Plan</span>
                    <span className="font-medium">{formatCurrency(selectedPlan.premiumAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-brand-border pt-2 font-semibold">
                  <span>Total</span>
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
                <span className="text-sm font-semibold">Mobile Money</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 rounded-xl border border-brand-border p-4 opacity-60"
              >
                <CreditCard className="h-6 w-6 text-brand-muted" />
                <span className="text-sm font-semibold text-brand-muted">Card (soon)</span>
              </button>
            </div>

            <Alert variant="default">
              Sandbox mode: payment ref <strong>{providerRef}</strong>
            </Alert>

            {paymentStatus === 'pending' && (
              <div className="flex items-center justify-center gap-2 py-4 text-brand-muted">
                <Spinner size="sm" />
                Processing payment…
              </div>
            )}

            <Button
              className="w-full"
              variant="pill-accent"
              onClick={() => completePaymentMutation.mutate()}
              disabled={completePaymentMutation.isPending || paymentStatus === 'pending'}
              loading={completePaymentMutation.isPending}
            >
              Simulate successful payment
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-brand-success" />
            <h2 className="text-xl font-bold text-brand-primary-dark">Enrollment complete!</h2>
            <p className="mt-2 text-sm text-brand-muted">Redirecting to your policy wallet…</p>
          </div>
        )}
      </div>
    </>
  );
}
