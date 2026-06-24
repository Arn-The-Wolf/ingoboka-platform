'use client';

import { useOtpDeliveryConfig } from '@/hooks/use-otp-config';

/** Prefetches OTP delivery config when auth screens mount. */
export function AuthOtpBootstrap({ children }: { children: React.ReactNode }) {
  useOtpDeliveryConfig();
  return <>{children}</>;
}
