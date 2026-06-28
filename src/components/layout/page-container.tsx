import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Narrower content column for forms and wizards */
  narrow?: boolean;
}

/** Standard page content wrapper — full-width web layout with sensible max-width. */
export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  );
}
