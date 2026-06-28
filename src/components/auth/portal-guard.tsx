'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { Spinner } from '@/components/ui/spinner';
import type { UserRole } from '@/types';

function dashboardForRole(role: UserRole): string {
  switch (role) {
    case 'CITIZEN':
      return '/dashboard';
    case 'INSURER_ADMIN':
    case 'INSURER_CLAIMS_OFFICER':
      return '/insurer/dashboard';
    case 'AGENT':
      return '/agent/dashboard';
    case 'PLATFORM_ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

interface PortalGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function PortalGuard({ allowedRoles, children }: PortalGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.replace(dashboardForRole(user.role));
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
