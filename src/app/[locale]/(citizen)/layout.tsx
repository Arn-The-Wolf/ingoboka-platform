import { PortalGuard } from '@/components/auth/portal-guard';
import { CitizenSidebar } from '@/components/layout/citizen-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['CITIZEN']}>
      <div className="flex min-h-screen bg-brand-background">
        <CitizenSidebar />
        <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
          {children}
        </div>
        <BottomNav />
      </div>
    </PortalGuard>
  );
}
