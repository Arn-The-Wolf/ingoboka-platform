import { PortalGuard } from '@/components/auth/portal-guard';
import { AgentSidebar } from '@/components/layout/agent-sidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['AGENT']}>
      <div className="flex h-screen overflow-hidden bg-brand-background">
        <AgentSidebar />
        <main className="flex-1 overflow-auto transition-all duration-300 lg:ml-64">
          <div className="mx-auto w-full max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </PortalGuard>
  );
}
