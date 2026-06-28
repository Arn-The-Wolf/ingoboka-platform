import { CitizenSidebar } from '@/components/layout/citizen-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function ClaimsLoading() {
  return (
    <div className="flex min-h-screen bg-brand-background">
      <CitizenSidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
        <PageSkeleton cards={3} />
      </div>
      <BottomNav />
    </div>
  );
}
