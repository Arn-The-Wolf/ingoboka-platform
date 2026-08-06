'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApiExt } from '@/lib/api';

export function useRecommendedProductIds() {
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['needs-assessment-preferences'],
    queryFn: () => customerApiExt.getNeedsAssessmentPreferences(),
    retry: false,
  });

  const recommendedIds = useMemo(() => {
    if (!prefs?.completed || !prefs.recommendedProducts?.length) {
      return new Set<string>();
    }
    return new Set(prefs.recommendedProducts.map((p) => p.id).filter(Boolean));
  }, [prefs]);

  return {
    recommendedIds,
    needsAssessmentCompleted: Boolean(prefs?.completed),
    recommendedProducts: prefs?.recommendedProducts ?? [],
    isLoading,
  };
}

export function isProductRecommended(productId: string, recommendedIds: Set<string>) {
  return recommendedIds.has(productId);
}
