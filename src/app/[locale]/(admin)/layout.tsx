import { PortalGuard } from '@/components/auth/portal-guard';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminToastProvider } from '@/components/admin/admin-toast';
import { StaffShell } from '@/components/layout/staff-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['PLATFORM_ADMIN']}>
      <AdminToastProvider>
        <StaffShell
          sidebar={<AdminSidebar />}
          className="bg-gradient-to-br from-green-50 via-blue-50/30 to-purple-50/20"
        >
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            {/* Top padding clears the floating mobile menu; PageContainer supplies page gutters. */}
            <div className="pt-16 xl:pt-0">{children}</div>
          </main>
        </StaffShell>
      </AdminToastProvider>
    </PortalGuard>
  );
}
