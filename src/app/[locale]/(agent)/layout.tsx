import { PortalGuard } from '@/components/auth/portal-guard';
import { AgentSidebar } from '@/components/layout/agent-sidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['AGENT']}>
      <div className="flex min-h-screen bg-brand-background">
        <AgentSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </PortalGuard>
  );
}
