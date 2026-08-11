'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimApi, insurerPortalApi } from '@/lib/api';
import type { ClaimDecisionRequest } from '@/types';

export function useClaims(page = 0, size = 10) {
  return useQuery({
    queryKey: ['claims', page, size],
    queryFn: () => claimApi.list(page, size),
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
    queryKey: ['insurer', 'dashboard'],
    queryFn: () => insurerPortalApi.getStats(),
  });
}

export function useClaimAppeal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => claimApi.appeal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useClaimCancel(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => claimApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useClaimDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => claimApi.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['insurer', 'dashboard'] });
    },
  });
}
