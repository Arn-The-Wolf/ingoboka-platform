import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setAccessToken } from '@/lib/api/client';
import { clearPendingVerification } from '@/lib/auth/pending-verification';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  pendingPhone: string | null;
  pendingEmail: string | null;
  verifyHint: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setPendingPhone: (phone: string | null) => void;
  setPendingEmail: (email: string | null) => void;
  setVerifyHint: (hint: string | null) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      pendingPhone: null,
      pendingEmail: null,
      verifyHint: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setAccessToken(accessToken);
        clearPendingVerification();
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          pendingPhone: null,
          pendingEmail: null,
          verifyHint: null,
        });
      },

      setPendingPhone: (phone) => set({ pendingPhone: phone }),
      setPendingEmail: (email) => set({ pendingEmail: email }),
      setVerifyHint: (hint) => set({ verifyHint: hint }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        setAccessToken(null);
        clearPendingVerification();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          pendingPhone: null,
          pendingEmail: null,
          verifyHint: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'ingoboka-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    }
  )
);
