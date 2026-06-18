'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi, customerApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { ConsentRequest, LoginRequest, OtpVerifyRequest, RegisterRequest } from '@/types';
import { useRouter } from '@/i18n/routing';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      if (data.user.role.startsWith('INSURER')) {
        router.push('/insurer/dashboard');
      } else if (data.user.role === 'PLATFORM_ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'AGENT') {
        router.push('/agent/dashboard');
      } else if (!data.user.consentGiven) {
        router.push('/consent');
      } else {
        router.push('/dashboard');
      }
    },
  });
}

export function useRegister() {
  const setPendingPhone = useAuthStore((s) => s.setPendingPhone);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (_data, variables) => {
      setPendingPhone(variables.phone);
      router.push('/verify');
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
      router.push('/consent');
    },
  });
}

export function useConsent() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ConsentRequest) => customerApi.submitConsent(payload),
    onSuccess: (user) => {
      updateUser(user);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      router.push('/login');
    },
  });
}
