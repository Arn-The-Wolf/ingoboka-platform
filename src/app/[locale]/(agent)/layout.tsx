import { AgentSidebar } from '@/components/layout/agent-sidebar';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-background">
      <AgentSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
