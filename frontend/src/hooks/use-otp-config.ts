'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

/** Fetches OTP delivery mode once per session (email vs SMS vs LOG). */
export function useOtpDeliveryConfig() {
  return useQuery({
    queryKey: ['auth', 'otp-delivery-config'],
    queryFn: () => authApi.getOtpDeliveryConfig(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
