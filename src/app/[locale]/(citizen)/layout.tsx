import { PortalGuard } from '@/components/auth/portal-guard';
import { CitizenSidebar } from '@/components/layout/citizen-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['CITIZEN']}>
      <div className="flex min-h-screen bg-brand-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CitizenSidebar />
        <main id="main-content" className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </PortalGuard>
  );
}
