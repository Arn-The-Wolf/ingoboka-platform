import { Skeleton } from '@/components/ui/skeleton';

export default function MarketingLoading() {
  return (
    <div className="space-y-0">
      <Skeleton className="h-16 w-full rounded-none" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 lg:px-8">
        <Skeleton className="mx-auto h-10 w-2/3 max-w-lg" />
        <Skeleton className="mx-auto h-5 w-full max-w-xl" />
        <div className="grid gap-4 pt-8 md:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  );
}
