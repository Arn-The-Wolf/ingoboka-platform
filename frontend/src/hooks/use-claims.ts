'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimApi } from '@/lib/api';
import type { ClaimDecisionRequest } from '@/types';

export function useClaims() {
  return useQuery({
    queryKey: ['claims'],
    queryFn: () => claimApi.list(),
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: ['claims', id],
    queryFn: () => claimApi.getById(id),
    enabled: !!id,
  });
}

export function useInsurerStats() {
  return useQuery({
    queryKey: ['insurer', 'stats'],
    queryFn: () => claimApi.getInsurerStats(),
  });
}

export function useClaimDecision(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClaimDecisionRequest) =>
      claimApi.decide(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claims', id] });
      queryClient.invalidateQueries({ queryKey: ['insurer', 'stats'] });
    },
  });
}
