import { PortalGuard } from '@/components/auth/portal-guard';
import { AnnouncementBanner } from '@/components/citizen/announcement-banner';
import { CitizenSidebar } from '@/components/layout/citizen-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DashboardContent } from '@/components/layout/dashboard-content';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['CITIZEN']}>
      <div className="flex h-screen overflow-hidden bg-brand-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CitizenSidebar />
        <DashboardContent
          className="ml-0 pb-20 lg:ml-64 lg:pb-0"
          innerClassName="min-h-full flex flex-col"
        >
          <AnnouncementBanner />
          <div id="main-content" className="flex-1">{children}</div>
        </DashboardContent>
        <BottomNav />
      </div>
    </PortalGuard>
  );
}
