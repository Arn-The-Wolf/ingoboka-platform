import { PortalGuard } from '@/components/auth/portal-guard';
import { Sidebar } from '@/components/layout/sidebar';

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard allowedRoles={['INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER']}>
      <div className="flex min-h-screen bg-brand-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </PortalGuard>
  );
}
