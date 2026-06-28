import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  /** Number of content card placeholders */
  cards?: number;
  showHeader?: boolean;
}

export function PageSkeleton({ cards = 3, showHeader = true }: PageSkeletonProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}
