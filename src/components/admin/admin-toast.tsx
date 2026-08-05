'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface AdminToastContextValue {
  toast: (tone: ToastTone, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: typeof CheckCircle2; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'border-brand-success/30', iconColor: 'text-brand-success' },
  error: { icon: AlertTriangle, ring: 'border-brand-error/30', iconColor: 'text-brand-error' },
  info: { icon: Info, ring: 'border-brand-primary/30', iconColor: 'text-brand-primary' },
};

/** Self-contained animated toast provider scoped to the admin console. */
export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, tone, title, description }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo<AdminToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast('success', title, description),
      error: (title, description) => toast('error', title, description),
      info: (title, description) => toast('info', title, description),
    }),
    [toast]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
        {toasts.map((t) => {
          const { icon: Icon, ring, iconColor } = TONE_STYLES[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-fade-in-up items-start gap-3 rounded-xl border bg-white p-4 shadow-elevated',
                ring
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-primary-dark">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-brand-muted">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-md p-1 text-brand-muted transition-colors hover:bg-brand-surface-container hover:text-brand-primary-dark"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    // No-op fallback so components never crash when rendered outside the provider.
    return {
      toast: () => undefined,
      success: () => undefined,
      error: () => undefined,
      info: () => undefined,
    };
  }
  return ctx;
}
