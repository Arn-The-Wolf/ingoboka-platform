'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi, customerApi } from '@/lib/api';
import { isInsurerPortalRole } from '@/lib/api/mappers';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { useAuthStore } from '@/store/auth-store';
import type { ConsentRequest, LoginRequest, RegisterRequest, UserRole } from '@/types';
import { useRouter } from '@/i18n/routing';

function routeAfterAuth(
  router: ReturnType<typeof useRouter>,
  user: { role: string; consentGiven: boolean }
) {
  let targetPath = '/dashboard';
  
  if (user.role === 'PLATFORM_ADMIN') {
    targetPath = '/admin/dashboard';
  } else if (user.role === 'AGENT') {
    targetPath = '/agent/dashboard';
  } else if (isInsurerPortalRole(user.role as UserRole)) {
    targetPath = '/insurer/dashboard';
  } else if (!user.consentGiven) {
    targetPath = '/consent';
  }

  // Use window.location for reliable navigation (avoids Next.js router issues)
  window.location.href = `/rw${targetPath}`;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Use window.location for reliable navigation
      routeAfterAuth(router, data.user);
    },
  });
}

export function useRegister() {
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const setVerifyHint = useAuthStore((s) => s.setVerifyHint);
  const router = useRouter();

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
      // Use window.location for reliable navigation
      window.location.href = '/rw/verify';
    },
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const router = useRouter();

  return useMutation({
    mutationFn: (code: string) =>
      authApi.verifyOtp({ phone: pendingPhone ?? '', code }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Use window.location for reliable navigation
      routeAfterAuth(router, data.user);
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
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ConsentRequest) => customerApi.submitConsent(payload),
    onSuccess: (updates) => {
      updateUser(updates);
      // Use window.location for reliable navigation
      window.location.href = '/rw/dashboard';
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken),
    onSettled: () => {
      logout();
      // Use window.location for reliable navigation
      window.location.href = '/rw/login';
    },
  });
}
