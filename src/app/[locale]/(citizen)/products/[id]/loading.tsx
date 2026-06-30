import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function ProductDetailLoading() {
  return <PageSkeleton cards={2} showHeader={false} />;
}
