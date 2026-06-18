'use client';

import { useQuery } from '@tanstack/react-query';
import { policyApi } from '@/lib/api';

export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: () => policyApi.list(),
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: () => policyApi.getById(id),
    enabled: !!id,
  });
}

export function usePolicyCard(id: string) {
  return useQuery({
    queryKey: ['policies', id, 'card'],
    queryFn: () => policyApi.getCard(id),
    enabled: !!id,
  });
}

export function usePublicVerification(token: string) {
  return useQuery({
    queryKey: ['verify', token],
    queryFn: () => policyApi.verifyPublic(token),
    enabled: !!token,
    retry: false,
  });
}
