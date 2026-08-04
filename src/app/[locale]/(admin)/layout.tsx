import { PortalGuard } from '@/components/auth/portal-guard';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['PLATFORM_ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-brand-background">
        <AdminSidebar />
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
