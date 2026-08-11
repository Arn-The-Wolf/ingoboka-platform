'use client';

import { useEffect, useRef } from 'react';
import { authApi, customerApi, profilePictureApi } from '@/lib/api';
import { setAccessToken, setForbiddenHandler, setTokenRefreshHandler, setUnauthorizedHandler } from '@/lib/api/client';
import { resolveOnboardingPath } from '@/lib/auth/onboarding';
import { getPathname, routing } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import type { ApiError } from '@/types';

async function refreshProfilePictureUrl(): Promise<string | undefined | null> {
  try {
    const pic = await profilePictureApi.get();
    return pic.profilePictureUrl;
  } catch {
    return undefined;
  }
}

export function useAuthInit() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const refreshed = useRef(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUnauthorizedHandler(() => logout());
    setForbiddenHandler((error: ApiError) => {
      const currentUser = useAuthStore.getState().user;
      const locale =
        (window.location.pathname.split('/')[1] as (typeof routing.locales)[number]) ||
        routing.defaultLocale;

      if (error.code === 'EMAIL_VERIFICATION_REQUIRED') {
        if (currentUser) {
          updateUser({
            requiresEmailVerification: true,
            emailVerified: false,
            status: 'PENDING_EMAIL_VERIFICATION',
          });
        }
        window.location.href = getPathname({ href: '/verify-email', locale });
        return;
      }
      if (error.code === 'MUST_CHANGE_PASSWORD') {
        if (currentUser) {
          updateUser({ mustChangePassword: true, status: 'PENDING_PASSWORD_CHANGE' });
        }
        window.location.href = getPathname({ href: '/change-password', locale });
      }
    });
    setTokenRefreshHandler(async () => {
      const rt = useAuthStore.getState().refreshToken;
      const u = useAuthStore.getState().user;
      if (!rt || !u) return null;
      try {
        const tokens = await authApi.refresh(rt);
        const nextUser = tokens.user ?? u;
        setAuth(nextUser, tokens.accessToken, tokens.refreshToken);
        return tokens.accessToken;
      } catch {
        logout();
        return null;
      }
    });
  }, [accessToken, logout, setAuth, updateUser]);

  useEffect(() => {
    if (refreshed.current || !refreshToken || !user) return;
    refreshed.current = true;

    authApi
      .refresh(refreshToken)
      .then((tokens) => {
        const nextUser = tokens.user ?? user;
        setAuth(nextUser, tokens.accessToken, tokens.refreshToken);
      })
      .catch(() => {
        logout();
      });
  }, [refreshToken, user, setAuth, logout]);

  useEffect(() => {
    if (hydrated.current || !accessToken || !user) return;
    hydrated.current = true;

    const hydrate = async () => {
      if (user.role === 'CITIZEN') {
        try {
          const profile = await customerApi.getMe();
          updateUser(profile);
          return;
        } catch {
          /* fall through to profile picture refresh */
        }
      }

      const profilePictureUrl = await refreshProfilePictureUrl();
      if (profilePictureUrl !== undefined) {
        updateUser({ profilePictureUrl: profilePictureUrl ?? undefined });
      }
    };

    void hydrate();
  }, [accessToken, user, updateUser]);
}
