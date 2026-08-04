'use client';

import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Top-of-page progress bar shown during client-side route transitions. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden
    >
      <div
        className={cn(
          'h-full w-full origin-left bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary',
          visible && 'animate-[navigation-progress_0.7s_ease-in-out_infinite]'
        )}
      />
    </div>
  );
}
