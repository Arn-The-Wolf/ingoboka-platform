import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function DependantsLoading() {
  return <PageSkeleton cards={3} showHeader={false} />;
}
