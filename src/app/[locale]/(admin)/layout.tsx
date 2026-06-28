import { PortalGuard } from '@/components/auth/portal-guard';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['PLATFORM_ADMIN']}>
      <div className="flex min-h-screen bg-brand-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </PortalGuard>
  );
}
