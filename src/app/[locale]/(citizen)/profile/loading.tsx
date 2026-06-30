import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function ProfileLoading() {
  return <PageSkeleton cards={2} showHeader={false} />;
}
