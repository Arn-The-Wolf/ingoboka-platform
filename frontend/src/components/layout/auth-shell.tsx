'use client';

import { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
}

/** Auth pages wrapper — surface-container background per design system. */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-brand-accent/15 blur-2xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
        {children}
      </div>
    </div>
  );
}
