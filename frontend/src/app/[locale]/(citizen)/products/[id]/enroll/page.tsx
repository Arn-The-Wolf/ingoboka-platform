'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { enrollmentApi, paymentApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';

export default function EnrollPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const productId = params.id;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'pay' | 'done'>('plan');
  const [providerRef, setProviderRef] = useState<string | null>(null);

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
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'}/payments/sandbox/callback`,
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
      setStep('done');
      router.push('/dashboard');
    },
  });

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link href="/products" className="text-sm text-brand-primary">
        ← Back to products
      </Link>
      <h1 className="mt-4 text-xl font-bold">{product.name}</h1>
      <p className="mt-2 text-sm text-brand-muted">{product.termsSummary}</p>

      {step === 'plan' && (
        <div className="mt-6 space-y-3">
          {product.plans?.map((plan) => (
            <Card
              key={plan.id}
              className={selectedPlanId === plan.id ? 'ring-2 ring-brand-primary' : ''}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CardContent className="p-4">
                <p className="font-semibold">{plan.name}</p>
                <p className="text-sm text-brand-muted">{plan.billingFrequency}</p>
                <p className="mt-1 font-medium">{formatCurrency(plan.premiumAmount)}</p>
              </CardContent>
            </Card>
          ))}
          <Button
            className="w-full"
            disabled={!selectedPlanId || enrollMutation.isPending}
            onClick={() => selectedPlanId && enrollMutation.mutate(selectedPlanId)}
          >
            {enrollMutation.isPending ? 'Processing…' : 'Continue to payment'}
          </Button>
        </div>
      )}

      {step === 'pay' && (
        <Card className="mt-6">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm">Sandbox payment reference: {providerRef}</p>
            <Button
              className="w-full"
              onClick={() => completePaymentMutation.mutate()}
              disabled={completePaymentMutation.isPending}
            >
              Simulate successful payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
