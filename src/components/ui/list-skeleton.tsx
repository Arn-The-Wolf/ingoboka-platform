import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

export function ListSkeleton({ rows = 6, className }: ListSkeletonProps) {
  return (
    <div className={className ?? 'space-y-3'}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" shimmer />
      ))}
    </div>
  );
}
