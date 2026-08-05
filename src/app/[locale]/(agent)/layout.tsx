import { PortalGuard } from '@/components/auth/portal-guard';
import { AgentSidebar } from '@/components/layout/agent-sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['AGENT']}>
      <div className="flex h-screen overflow-hidden bg-brand-background">
        <AgentSidebar />
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
