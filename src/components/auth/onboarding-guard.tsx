'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { resolveOnboardingPath } from '@/lib/auth/onboarding';
import { Spinner } from '@/components/ui/spinner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/** Redirect authenticated users who must finish password change or email verification. */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    const path = resolveOnboardingPath(user);
    if (path) router.replace(path);
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated && resolveOnboardingPath(user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
