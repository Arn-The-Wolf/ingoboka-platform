import { PortalGuard } from '@/components/auth/portal-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';
import { StaffShell } from '@/components/layout/staff-shell';

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER']}>
      <StaffShell sidebar={<Sidebar />} className="bg-brand-background">
        <DashboardContent innerClassName="mx-auto w-full max-w-7xl p-4 pt-16 sm:p-6 xl:pt-6">
          {children}
        </DashboardContent>
      </StaffShell>
    </PortalGuard>
  );
}
