'use client';

import { useQuery } from '@tanstack/react-query';
import { listClaimDocuments } from '@/lib/api/documents';

export function useClaimDocuments(claimId: string) {
  return useQuery({
    queryKey: ['claims', claimId, 'documents'],
    queryFn: () => listClaimDocuments(claimId),
    enabled: !!claimId,
  });
}
