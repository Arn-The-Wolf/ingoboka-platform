'use client';

import { useEffect } from 'react';
import { setAccessToken, setUnauthorizedHandler } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth-store';

export function useAuthInit() {
  const { accessToken, logout } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUnauthorizedHandler(() => logout());
  }, [accessToken, logout]);
}
