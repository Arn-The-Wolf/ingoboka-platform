'use client';

import { useEffect, useRef } from 'react';
import { authApi } from '@/lib/api';
import { setAccessToken, setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth-store';

export function useAuthInit() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const refreshed = useRef(false);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUnauthorizedHandler(() => logout());
  }, [accessToken, logout]);

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
}
