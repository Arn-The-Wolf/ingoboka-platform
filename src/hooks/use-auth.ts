'use client';

import { useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { authApi, customerApi } from '@/lib/api';
import { isInsurerPortalRole } from '@/lib/api/mappers';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { useAuthStore } from '@/store/auth-store';
import type { ConsentRequest, LoginRequest, RegisterRequest, UserRole } from '@/types';
import { getPathname, routing } from '@/i18n/routing';

type AppLocale = (typeof routing.locales)[number];

/** Build a locale-aware path for full-page redirects (respects as-needed prefix). */
function localizedPath(href: `/${string}`, locale: string) {
  return getPathname({ href, locale: locale as AppLocale });
}

function routeAfterAuth(locale: string, user: { role: string; consentGiven: boolean }) {
  let targetPath: `/${string}` = '/dashboard';

  if (user.role === 'PLATFORM_ADMIN') {
    targetPath = '/admin/dashboard';
  } else if (user.role === 'AGENT') {
    targetPath = '/agent/dashboard';
  } else if (isInsurerPortalRole(user.role as UserRole)) {
    targetPath = '/insurer/dashboard';
  } else if (!user.consentGiven) {
    targetPath = '/consent';
  }

  // Full navigation preserves reliability while keeping the active locale
  window.location.href = localizedPath(targetPath, locale);
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const locale = useLocale();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      routeAfterAuth(locale, data.user);
    },
  });
}

export function useRegister() {
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setVerifyHint = useAuthStore((s) => s.setVerifyHint);
  const locale = useLocale();

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const config = await authApi.getOtpDeliveryConfig();
      setVerifyHint(config.verifyHint);
      await authApi.register(payload);
      return config;
    },
    onSuccess: (_config, variables) => {
      setPendingPhone(normalizeCitizenPhone(variables.phone));
      setPendingEmail(variables.email ?? null);
      window.location.href = localizedPath('/verify', locale);
    },
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const locale = useLocale();

  return useMutation({
    mutationFn: (code: string) =>
      authApi.verifyOtp({ phone: pendingPhone ?? '', code }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      routeAfterAuth(locale, data.user);
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
