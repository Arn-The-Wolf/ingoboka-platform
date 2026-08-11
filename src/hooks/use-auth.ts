'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { authApi, customerApi } from '@/lib/api';
import { isInsurerPortalRole } from '@/lib/api/mappers';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import {
  readPendingVerification,
  resolvePendingVerificationFromUrl,
  savePendingVerification,
} from '@/lib/auth/pending-verification';
import { useAuthStore } from '@/store/auth-store';
import { resolveOnboardingPath } from '@/lib/auth/onboarding';
import type { ConsentRequest, LoginRequest, RegisterRequest, User, UserRole } from '@/types';
import { getPathname, routing } from '@/i18n/routing';

type AppLocale = (typeof routing.locales)[number];

/** Build a locale-aware path for full-page redirects (respects as-needed prefix). */
function localizedPath(href: `/${string}`, locale: string) {
  return getPathname({ href, locale: locale as AppLocale });
}

/**
 * Resolves the post-authentication destination (locale prefix added by caller).
 * Navigation itself is left to the page so it can show a welcome overlay first.
 */
export function getPostAuthPath(user: {
  role: string;
  consentGiven: boolean;
  mustChangePassword?: boolean;
  requiresEmailVerification?: boolean;
  emailVerified?: boolean;
  status?: string;
}): string {
  const onboarding = resolveOnboardingPath(user as User);
  if (onboarding) return onboarding;
  if (user.role === 'PLATFORM_ADMIN') return '/admin/dashboard';
  if (user.role === 'AGENT') return '/agent/dashboard';
  if (isInsurerPortalRole(user.role as UserRole)) return '/insurer/dashboard';
  if (!user.consentGiven) return '/consent';
  return '/dashboard';
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useRegister() {
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setVerifyHint = useAuthStore((s) => s.setVerifyHint);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const config = await authApi.getOtpDeliveryConfig();
      setVerifyHint(config.verifyHint);
      await authApi.register(payload);
      return config;
    },
    onSuccess: (config, variables) => {
      const phone = normalizeCitizenPhone(variables.phone);
      setPendingPhone(phone);
      setPendingEmail(variables.email ?? null);
      savePendingVerification({
        phone,
        email: variables.email ?? null,
        verifyHint: config.verifyHint ?? null,
      });
    },
  });
}

/** Restore pending OTP context after a full-page redirect (query param + sessionStorage). */
export function usePendingVerification() {
  const searchParams = useSearchParams();
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const verifyHint = useAuthStore((s) => s.verifyHint);
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setVerifyHint = useAuthStore((s) => s.setVerifyHint);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState<{
    phone: string | null;
    email: string | null;
    verifyHint: string | null;
  } | null>(null);

  useEffect(() => {
    if (pendingPhone) {
      setReady(true);
      return;
    }

    const resolved =
      resolvePendingVerificationFromUrl(searchParams.get('phone')) ?? readPendingVerification();

    if (resolved?.phone) {
      setRestored({
        phone: resolved.phone,
        email: resolved.email,
        verifyHint: resolved.verifyHint,
      });
      setPendingPhone(resolved.phone);
      setPendingEmail(resolved.email);
      setVerifyHint(resolved.verifyHint);
    }

    setReady(true);
  }, [
    pendingPhone,
    searchParams,
    setPendingEmail,
    setPendingPhone,
    setVerifyHint,
  ]);

  return {
    ready,
    phone: pendingPhone ?? restored?.phone ?? null,
    email: pendingEmail ?? restored?.email ?? null,
    verifyHint: verifyHint ?? restored?.verifyHint ?? null,
  };
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);

  return useMutation({
    mutationFn: (code: string) =>
      authApi.verifyOtp({ phone: pendingPhone ?? '', code }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useResendOtp() {
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  return useMutation({
    mutationFn: () => authApi.resendOtp(pendingPhone ?? ''),
  });
}

export function useConsent() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const locale = useLocale();

  return useMutation({
    mutationFn: (payload: ConsentRequest) => customerApi.submitConsent(payload),
    onSuccess: (updates) => {
      updateUser(updates);
      window.location.href = localizedPath('/dashboard', locale);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const locale = useLocale();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken),
    onSettled: () => {
      logout();
      window.location.href = localizedPath('/login', locale);
    },
  });
}
