import { PortalGuard } from '@/components/auth/portal-guard';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';
import { AnnouncementBanner } from '@/components/citizen/announcement-banner';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/layout/dashboard-content';
import { StaffShell } from '@/components/layout/staff-shell';

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER']}>
      <OnboardingGuard>
      <StaffShell sidebar={<Sidebar />} className="bg-brand-background">
        <AnnouncementBanner />
        <DashboardContent innerClassName="mx-auto w-full max-w-7xl p-4 pt-16 sm:p-6 xl:pt-6">
          {children}
        </DashboardContent>
      </StaffShell>
      </OnboardingGuard>
    </PortalGuard>
  );
}
