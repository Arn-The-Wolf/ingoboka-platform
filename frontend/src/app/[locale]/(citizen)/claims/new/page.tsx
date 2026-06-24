'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { claimApi, policyApi } from '@/lib/api';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Car,
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'ACCIDENT', label: 'Accident', icon: Car },
  { id: 'ILLNESS', label: 'Illness', icon: Stethoscope },
  { id: 'HOSPITAL', label: 'Hospital visit', icon: HeartPulse },
  { id: 'OTHER', label: 'Other', icon: AlertTriangle },
] as const;

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [policyId, setPolicyId] = useState('');
  const [claimType, setClaimType] = useState('ACCIDENT');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('50000');

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policyApi.list(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const created = await claimApi.create({
        policyId,
        claimType,
        description,
        incidentDate: new Date().toISOString().slice(0, 10),
        claimedAmount: Number(claimedAmount),
      });
      await claimApi.submit((created as { id: string }).id);
      return created;
    },
    onSuccess: () => router.push('/dashboard'),
  });

  const activePolicies = (policies?.content ?? []).filter((p) => p.status === 'ACTIVE');

  return (
    <>
      <CitizenHeader title="Claims" />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <Link href="/dashboard" className="text-sm font-medium text-brand-muted hover:text-brand-primary">
          ← Back
        </Link>

        <StepIndicator totalSteps={4} currentStep={step} className="my-6" />

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-6">
            {step === 1 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">What happened?</h2>
                  <p className="text-sm text-brand-muted">Select the type of incident you want to report.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {INCIDENT_TYPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setClaimType(id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-5 transition-all',
                        claimType === id
                          ? 'border-brand-primary bg-brand-surface-container-low'
                          : 'border-brand-border bg-white hover:border-brand-primary/50'
                      )}
                    >
                      <Icon className="h-8 w-8 text-brand-primary" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full" variant="pill" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">Select policy</h2>
                  <p className="text-sm text-brand-muted">Choose the active policy for this claim.</p>
                </div>
                <div className="space-y-2">
                  {activePolicies.map((p) => (
                    <Card
                      key={p.id}
                      className={cn(
                        'cursor-pointer transition-all',
                        policyId === p.id && 'border-brand-primary ring-2 ring-brand-primary/20'
                      )}
                      onClick={() => setPolicyId(p.id)}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold">{p.productName}</p>
                        <p className="text-xs text-brand-muted">{p.policyNumber}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill"
                    disabled={!policyId}
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">Describe the incident</h2>
                  <p className="text-sm text-brand-muted">Provide details to help process your claim.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened and when?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Claimed amount (RWF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill"
                    disabled={!description}
                    onClick={() => setStep(4)}
                  >
                    Review
                  </Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">Review &amp; submit</h2>
                  <p className="text-sm text-brand-muted">Confirm your claim details before submitting.</p>
                </div>
                <Card>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Type</span>
                      <span className="font-medium">{claimType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Policy</span>
                      <span className="font-medium">
                        {activePolicies.find((p) => p.id === policyId)?.policyNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Amount</span>
                      <span className="font-medium">{Number(claimedAmount).toLocaleString()} RWF</span>
                    </div>
                    <p className="border-t border-brand-border pt-2 text-brand-muted">{description}</p>
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill-accent"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    Submit claim
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
