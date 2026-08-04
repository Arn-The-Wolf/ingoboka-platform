import { PortalGuard } from '@/components/auth/portal-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER']}>
      <div className="flex h-screen overflow-hidden bg-brand-background">
        <Sidebar />
        <DashboardContent
          className="lg:ml-64"
          innerClassName="mx-auto w-full max-w-7xl p-6 pt-16 lg:pt-6"
        >
          {children}
        </DashboardContent>
      </div>
    </PortalGuard>
  );
}
