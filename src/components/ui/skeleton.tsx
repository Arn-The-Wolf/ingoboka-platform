import { cn } from '@/lib/utils';

function Skeleton({ className, shimmer, ...props }: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        shimmer ? 'skeleton-shimmer rounded-md' : 'animate-pulse rounded-md bg-brand-surface-container',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
