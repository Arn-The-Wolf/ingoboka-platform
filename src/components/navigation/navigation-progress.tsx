'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Top-of-page progress bar shown during client-side route transitions. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [isPending] = useTransition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  const show = visible || isPending;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-200',
        show ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden
    >
      <div
        className={cn(
          'h-full w-1/3 bg-brand-accent',
          show && 'animate-[navigation-progress_0.8s_ease-in-out_infinite]'
        )}
      />
    </div>
  );
}
