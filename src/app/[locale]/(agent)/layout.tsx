import { PortalGuard } from '@/components/auth/portal-guard';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';
import { AgentSidebar } from '@/components/layout/agent-sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';
import { StaffShell } from '@/components/layout/staff-shell';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['AGENT']}>
      <OnboardingGuard>
      <StaffShell sidebar={<AgentSidebar />} className="bg-brand-background">
        <DashboardContent innerClassName="mx-auto w-full max-w-7xl p-4 pt-16 sm:p-6 xl:pt-6">
          {children}
        </DashboardContent>
      </StaffShell>
      </OnboardingGuard>
    </PortalGuard>
  );
}
