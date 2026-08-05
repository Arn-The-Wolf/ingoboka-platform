'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { PageTransition } from '@/components/ui/page-transition';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

/** Wraps dashboard pages with route transition + brief loading overlay. */
export function DashboardContent({ children, className, innerClassName }: DashboardContentProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <main className={cn('relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto', className)}>
      {loading && (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center bg-brand-background/50 pt-24 backdrop-blur-[1px] animate-fade-in"
          aria-hidden
        >
          <div className="flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2 shadow-elevated">
            <Spinner size="sm" />
            <span className="text-xs font-medium text-brand-muted">Loading…</span>
          </div>
        </div>
      )}
      <div className={cn('min-w-0', innerClassName)}>
        <PageTransition key={pathname}>{children}</PageTransition>
      </div>
    </main>
  );
}
