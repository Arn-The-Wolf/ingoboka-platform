'use client';

import { useEffect, useRef } from 'react';
import { authApi, customerApi } from '@/lib/api';
import { setAccessToken, setTokenRefreshHandler, setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth-store';

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
    setTokenRefreshHandler(async () => {
      const rt = useAuthStore.getState().refreshToken;
      const u = useAuthStore.getState().user;
      if (!rt || !u) return null;
      try {
        const tokens = await authApi.refresh(rt);
        setAuth(u, tokens.accessToken, tokens.refreshToken);
        return tokens.accessToken;
      } catch {
        logout();
        return null;
      }
    });
  }, [accessToken, logout, setAuth]);

  useEffect(() => {
    if (refreshed.current || !refreshToken || !user) return;
    refreshed.current = true;

    authApi
      .refresh(refreshToken)
      .then((tokens) => {
        setAuth(user, tokens.accessToken, tokens.refreshToken);
      })
      .catch(() => {
        logout();
      });
  }, [refreshToken, user, setAuth, logout]);

  useEffect(() => {
    if (hydrated.current || !accessToken || !user) return;
    if (user.role !== 'CITIZEN') return;
    hydrated.current = true;

    customerApi
      .getMe()
      .then((profile) => updateUser(profile))
      .catch(() => {
        /* keep JWT user */
      });
  }, [accessToken, user, updateUser]);
}
