'use client';

import { useEffect, useRef } from 'react';
import { authApi, customerApi, profilePictureApi } from '@/lib/api';
import { setAccessToken, setTokenRefreshHandler, setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth-store';

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
  }, [accessToken, logout, setAuth]);

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
