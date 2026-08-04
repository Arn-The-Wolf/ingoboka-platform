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
          innerClassName="mx-auto w-full max-w-7xl px-4 pb-8 pt-20 pl-16 sm:px-6 lg:px-8 lg:pl-8 lg:pt-6"
        >
          {children}
        </DashboardContent>
      </div>
    </PortalGuard>
  );
}
