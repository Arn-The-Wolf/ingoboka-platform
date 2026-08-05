'use client';

import * as React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export type WelcomeState = 'hidden' | 'loading' | 'welcome';

interface WelcomeOverlayProps {
  state: WelcomeState;
  title: string;
  subtitle?: string;
  loadingText: string;
}

/**
 * Full-screen branded overlay shown after a successful login/registration:
 * a brief loading phase, then an animated welcome message, before routing.
 */
export function WelcomeOverlay({ state, title, subtitle, loadingText }: WelcomeOverlayProps) {
  if (state === 'hidden') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-dark animate-fade-in"
      role="status"
      aria-live="assertive"
    >
      <div className="pointer-events-none absolute inset-0 auth-dot-pattern opacity-25" />
      <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -left-10 bottom-16 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-float-delayed" />

      <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
        {state === 'loading' ? (
          <>
            <Loader2 className="h-14 w-14 animate-spin text-brand-accent" />
            <p className="text-lg font-medium text-white/90">{loadingText}</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-scale-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-accent/20 ring-4 ring-brand-accent/30">
              <CheckCircle2 className="h-11 w-11 text-brand-accent" />
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            {subtitle && <p className="max-w-xs text-base text-white/80">{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

interface WelcomeSequenceOptions {
  loadingMs?: number;
  welcomeMs?: number;
}

/**
 * Drives the loading → welcome → done sequence. `start` transitions the
 * overlay and finally invokes `onDone` (typically a navigation).
 */
export function useWelcomeSequence() {
  const [state, setState] = React.useState<WelcomeState>('hidden');
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const start = React.useCallback((onDone: () => void, options?: WelcomeSequenceOptions) => {
    const loadingMs = options?.loadingMs ?? 850;
    const welcomeMs = options?.welcomeMs ?? 1600;

    setState('loading');
    timers.current.push(setTimeout(() => setState('welcome'), loadingMs));
    timers.current.push(setTimeout(onDone, loadingMs + welcomeMs));
  }, []);

  return { state, start, active: state !== 'hidden' };
}
