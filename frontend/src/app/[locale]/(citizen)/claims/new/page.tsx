'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { claimApi, policyApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function NewClaimPage() {
  const router = useRouter();
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
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link href="/dashboard" className="text-sm text-brand-primary">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-xl font-bold">Submit a claim</h1>

      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="mt-6">
          <CardContent className="space-y-4 p-4">
            <label className="block text-sm">
              Policy
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
              >
                <option value="">Select policy</option>
                {activePolicies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber ?? p.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Claim type
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Description
              <textarea
                className="mt-1 w-full rounded border px-3 py-2"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Claimed amount (RWF)
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                type="number"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
              />
            </label>
            <Button
              className="w-full"
              disabled={!policyId || !description || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Submitting…' : 'Submit claim'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
